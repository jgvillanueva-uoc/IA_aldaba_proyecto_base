import { TasksService } from './tasks.service';
import type { IceService } from '../ice/ice.service';
import type { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';
import type {
  TaskRepositoryPort,
  CreateTaskInput,
} from './ports/task-repository.port';
import type { ManualIceDto } from './dto/manual-ice.dto';

describe('TasksService', () => {
  let service: TasksService;
  let mockRepo: jest.Mocked<TaskRepositoryPort>;
  let mockIce: jest.Mocked<IceService>;
  let mockAi: jest.Mocked<AiService>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllByPriority: jest.fn(),
    } as unknown as jest.Mocked<TaskRepositoryPort>;
    mockIce = {
      calculateScore: jest.fn(),
      validateRange: jest.fn(),
      clampValues: jest.fn(),
    } as unknown as jest.Mocked<IceService>;
    mockAi = {
      estimateIce: jest.fn(),
    } as unknown as jest.Mocked<AiService>;
    service = new TasksService(mockRepo, mockAi, mockIce);
  });

  it('should list tasks by priority desc', async () => {
    const tasks = [
      { id: '1', iceScore: 100, createdAt: new Date('2024-01-01') },
      { id: '2', iceScore: 50, createdAt: new Date('2024-01-02') },
    ];
    mockRepo.findAllByPriority.mockResolvedValue(tasks as never);
    const result = await service.listTasksByPriority('desc');
    expect(result).toEqual(tasks);
    expect(mockRepo.findAllByPriority).toHaveBeenCalledWith('desc');
  });

  it('should list tasks by priority asc', async () => {
    const tasks = [
      { id: '2', iceScore: 50, createdAt: new Date('2024-01-02') },
      { id: '1', iceScore: 100, createdAt: new Date('2024-01-01') },
    ];
    mockRepo.findAllByPriority.mockResolvedValue(tasks as never);
    const result = await service.listTasksByPriority('asc');
    expect(result).toEqual(tasks);
    expect(mockRepo.findAllByPriority).toHaveBeenCalledWith('asc');
  });

  it('should create a task', async () => {
    const input: CreateTaskInput = { title: 'T1', description: 'D1' };
    const created = { ...input, id: '1', status: 'TODO' as const };
    mockRepo.create.mockResolvedValue(created as never);
    await expect(service.createTask(input)).resolves.toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith({ ...input, status: 'TODO' });
  });

  it('should list tasks', async () => {
    const tasks = [{ id: '1' }, { id: '2' }];
    mockRepo.findAll.mockResolvedValue(tasks as never);
    await expect(service.listTasks()).resolves.toEqual(tasks);
  });

  it('should get task by id or throw', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' } as never);
    await expect(service.getTaskByIdOrThrow('1')).resolves.toEqual({
      id: '1',
    });
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getTaskByIdOrThrow('x')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update task and recalc ICE if fields present', async () => {
    const current = { id: '1', impact: 2, confidence: 3, effort: 4 };
    mockRepo.findById.mockResolvedValue(current as never);
    mockIce.calculateScore.mockReturnValue(15);
    const updated = {
      ...current,
      impact: 5,
      confidence: 6,
      effort: 7,
      iceScore: 15,
      iceSource: 'MANUAL',
    };
    mockRepo.update.mockResolvedValue(updated as never);
    const result = await service.updateTask('1', {
      impact: 5,
      confidence: 6,
      effort: 7,
    });
    expect(result).toEqual(updated);
    expect(mockIce.calculateScore).toHaveBeenCalledWith(5, 6, 7);
    expect(mockRepo.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ iceScore: 15, iceSource: 'MANUAL' }),
    );
  });

  it('should throw if update target not found', async () => {
    mockRepo.findById.mockResolvedValue({
      id: '1',
      impact: 1,
      confidence: 1,
      effort: 1,
    } as never);
    mockRepo.update.mockResolvedValue(null);
    await expect(service.updateTask('1', { impact: 2 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should apply manual ICE and persist', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' } as never);
    mockIce.validateRange.mockReturnValue(undefined);
    mockIce.calculateScore.mockReturnValue(42);
    const updated = {
      id: '1',
      impact: 2,
      confidence: 3,
      effort: 4,
      iceScore: 42,
      iceSource: 'MANUAL',
    };
    mockRepo.update.mockResolvedValue(updated as never);
    const dto: ManualIceDto = { impact: 2, confidence: 3, effort: 4 };
    const result = await service.applyManualIce('1', dto);
    expect(result).toEqual(updated);
    expect(mockIce.validateRange).toHaveBeenCalledWith(2, 'impact');
    expect(mockIce.calculateScore).toHaveBeenCalledWith(2, 3, 4);
    expect(mockRepo.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ iceScore: 42, iceSource: 'MANUAL' }),
    );
  });

  it('should throw if applyManualIce target not found', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' } as never);
    mockIce.validateRange.mockReturnValue(undefined);
    mockIce.calculateScore.mockReturnValue(42);
    mockRepo.update.mockResolvedValue(null);
    const dto: ManualIceDto = { impact: 2, confidence: 3, effort: 4 };
    await expect(service.applyManualIce('1', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should estimate ICE with AI, clamp, calculate and persist', async () => {
    const task = { id: '1', description: 'desc' };
    mockRepo.findById.mockResolvedValue(task as never);
    mockAi.estimateIce.mockResolvedValue({
      impact: 11,
      confidence: 0,
      effort: 5,
    });
    mockIce.clampValues.mockReturnValue({
      impact: 10,
      confidence: 1,
      effort: 5,
    });
    mockIce.calculateScore.mockReturnValue(20);
    const updated = {
      ...task,
      impact: 10,
      confidence: 1,
      effort: 5,
      iceScore: 20,
      iceSource: 'AI',
    };
    mockRepo.update.mockResolvedValue(updated as never);
    const result = await service.estimateIceWithAi('1');
    expect(result).toEqual(updated);
    expect(mockAi.estimateIce).toHaveBeenCalledWith('desc');
    expect(mockIce.clampValues).toHaveBeenCalledWith(11, 0, 5);
    expect(mockIce.calculateScore).toHaveBeenCalledWith(10, 1, 5);
    expect(mockRepo.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ iceScore: 20, iceSource: 'AI' }),
    );
  });

  it('should throw if estimateIceWithAi target not found', async () => {
    mockRepo.findById.mockResolvedValue({
      id: '1',
      description: 'desc',
    } as never);
    mockAi.estimateIce.mockResolvedValue({
      impact: 1,
      confidence: 1,
      effort: 1,
    });
    mockIce.clampValues.mockReturnValue({
      impact: 1,
      confidence: 1,
      effort: 1,
    });
    mockIce.calculateScore.mockReturnValue(10);
    mockRepo.update.mockResolvedValue(null);
    await expect(service.estimateIceWithAi('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a task', async () => {
    mockRepo.delete.mockResolvedValue(true);
    await expect(service.deleteTask('1')).resolves.toBeUndefined();
    mockRepo.delete.mockResolvedValue(false);
    await expect(service.deleteTask('1')).rejects.toThrow(NotFoundException);
  });
});
