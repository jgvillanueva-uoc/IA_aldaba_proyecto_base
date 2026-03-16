import { TasksService } from './tasks.service';
import { IceService } from '../ice/ice.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let mockRepo: any;
  let mockIce: any;
  let mockAi: any;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockIce = {
      calculateScore: jest.fn(),
      validateRange: jest.fn(),
      clampValues: jest.fn(),
    };
    mockAi = {
      estimateIce: jest.fn(),
    };
    service = new TasksService(mockRepo, mockAi, mockIce);
  });

  it('should create a task', async () => {
    const input = { title: 'T1', description: 'D1' };
    const created = { ...input, id: '1', status: 'TODO' };
    mockRepo.create.mockResolvedValue(created);
    await expect(service.createTask(input as any)).resolves.toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith({ ...input, status: 'TODO' });
  });

  it('should list tasks', async () => {
    const tasks = [{ id: '1' }, { id: '2' }];
    mockRepo.findAll.mockResolvedValue(tasks);
    await expect(service.listTasks()).resolves.toEqual(tasks);
  });

  it('should get task by id or throw', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' });
    await expect(service.getTaskByIdOrThrow('1')).resolves.toEqual({ id: '1' });
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getTaskByIdOrThrow('x')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update task and recalc ICE if fields present', async () => {
    const current = { id: '1', impact: 2, confidence: 3, effort: 4 };
    mockRepo.findById.mockResolvedValue(current);
    mockIce.calculateScore.mockReturnValue(15);
    const updated = {
      ...current,
      impact: 5,
      confidence: 6,
      effort: 7,
      iceScore: 15,
      iceSource: 'MANUAL',
    };
    mockRepo.update.mockResolvedValue(updated);
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
    });
    mockRepo.update.mockResolvedValue(null);
    await expect(service.updateTask('1', { impact: 2 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should apply manual ICE and persist', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' });
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
    mockRepo.update.mockResolvedValue(updated);
    const dto = { impact: 2, confidence: 3, effort: 4 };
    const result = await service.applyManualIce('1', dto as any);
    expect(result).toEqual(updated);
    expect(mockIce.validateRange).toHaveBeenCalledWith(2, 'impact');
    expect(mockIce.calculateScore).toHaveBeenCalledWith(2, 3, 4);
    expect(mockRepo.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ iceScore: 42, iceSource: 'MANUAL' }),
    );
  });

  it('should throw if applyManualIce target not found', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1' });
    mockIce.validateRange.mockReturnValue(undefined);
    mockIce.calculateScore.mockReturnValue(42);
    mockRepo.update.mockResolvedValue(null);
    const dto = { impact: 2, confidence: 3, effort: 4 };
    await expect(service.applyManualIce('1', dto as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should estimate ICE with AI, clamp, calculate and persist', async () => {
    const task = { id: '1', description: 'desc' };
    mockRepo.findById.mockResolvedValue(task);
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
    mockRepo.update.mockResolvedValue(updated);
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
    mockRepo.findById.mockResolvedValue({ id: '1', description: 'desc' });
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
