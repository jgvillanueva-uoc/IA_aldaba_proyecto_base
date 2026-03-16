import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';

describe('AiService', () => {
  let service: AiService;
  let mockProvider: any;

  beforeEach(() => {
    mockProvider = {
      estimateIce: jest.fn(),
      getStatus: jest.fn(),
    };
    service = new AiService(mockProvider);
  });

  it('should delegate estimateIce to provider', async () => {
    const response = {
      impact: 5,
      confidence: 6,
      effort: 7,
      aiJustification: 'ok',
    };
    mockProvider.estimateIce.mockResolvedValue(response);
    await expect(service.estimateIce('desc')).resolves.toEqual(response);
    expect(mockProvider.estimateIce).toHaveBeenCalledWith('desc');
  });

  it('should return module status from provider', () => {
    mockProvider.getStatus.mockReturnValue('ready');
    expect(service.getModuleStatus()).toBe('ready');
    expect(mockProvider.getStatus).toHaveBeenCalled();
  });

  it('should propagate errors from provider', async () => {
    mockProvider.estimateIce.mockRejectedValue(new Error('AI error'));
    await expect(service.estimateIce('desc')).rejects.toThrow('AI error');
  });
});
