/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './user.schema';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;

  const userArray = [{ name: 'Esteban', email: 'esteban@email.com' }];

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            new: jest.fn().mockResolvedValue(userArray[0]),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByEmail', () => {
    it('should return a user if found', async () => {
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(userArray[0]),
      });

      const result = await service.getByEmail(userArray[0].email);
      expect(result).toEqual(userArray[0]);
    });

    it('should throw if user is not found', async () => {
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.getByEmail('notfound@email.com')).rejects.toThrow(NotFoundException);
    });
  });
});
