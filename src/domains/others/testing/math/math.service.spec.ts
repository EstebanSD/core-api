import { Test, TestingModule } from '@nestjs/testing';
import { MathService } from './math.service';

describe('MathService', () => {
  let service: MathService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MathService],
    }).compile();

    service = module.get<MathService>(MathService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add two numbers', () => {
    expect(service.add(2, 3)).toBe(5);
  });

  it('should subtract two numbers', () => {
    expect(service.subtract(5, 2)).toBe(3);
  });

  it('should multiply two numbers', () => {
    expect(service.multiply(4, 3)).toBe(12);
  });

  it('should divide two numbers', () => {
    expect(service.divide(10, 2)).toBe(5);
  });

  it('should throw when dividing by zero', () => {
    expect(() => service.divide(10, 0)).toThrow('Cannot divide by zero');
  });
});
