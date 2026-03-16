import { IceService } from './ice.service';
import { BadRequestException } from '@nestjs/common';

describe('IceService', () => {
  let service: IceService;

  beforeEach(() => {
    service = new IceService();
  });

  describe('validateRange', () => {
    it('should not throw for values within 1-10', () => {
      expect(() => service.validateRange(1, 'impact')).not.toThrow();
      expect(() => service.validateRange(10, 'confidence')).not.toThrow();
      expect(() => service.validateRange(5, 'effort')).not.toThrow();
    });

    it('should throw BadRequestException for values < 1', () => {
      expect(() => service.validateRange(0, 'impact')).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for values > 10', () => {
      expect(() => service.validateRange(11, 'confidence')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('calculateScore', () => {
    it('should calculate correct ICE score for valid inputs', () => {
      expect(service.calculateScore(10, 10, 1)).toBe(1000); // (10*10/1)*10 = 1000
      expect(service.calculateScore(5, 5, 5)).toBe(50); // (5*5/5)*10 = 50
      expect(service.calculateScore(7, 8, 2)).toBe(280); // (7*8/2)*10 = 280
    });

    it('should round the result to nearest integer', () => {
      expect(service.calculateScore(7, 7, 3)).toBe(163); // (7*7/3)*10 = 163.33
    });
  });

  describe('clampValues', () => {
    it('should clamp values below 1 to 1', () => {
      const result = service.clampValues(0, -5, 0.5);
      expect(result).toEqual({ impact: 1, confidence: 1, effort: 1 });
    });

    it('should clamp values above 10 to 10', () => {
      const result = service.clampValues(15, 20, 11);
      expect(result).toEqual({ impact: 10, confidence: 10, effort: 10 });
    });

    it('should leave values within range unchanged', () => {
      const result = service.clampValues(5, 7, 9);
      expect(result).toEqual({ impact: 5, confidence: 7, effort: 9 });
    });
  });
});
