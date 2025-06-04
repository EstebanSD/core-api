/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AboutService } from './about.service';
import { AboutGeneral, AboutTranslation } from '../schemas/about.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateAboutDto } from './dtos';
import { UploadFileParams } from 'src/libs/storage/interfaces';
import { uploadSingle } from 'src/libs/storage/helpers';

jest.mock('src/libs/storage/helpers', () => ({
  uploadSingle: jest.fn(),
}));

describe('AboutService', () => {
  let service: AboutService;
  let mockTranslationModel: any;
  let mockGeneralModel: any;
  let mockTranslationConstructor: jest.Mock;
  let mockGeneralConstructor: jest.Mock;
  const mockStorageService = {
    upload: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    mockTranslationConstructor = jest.fn();
    mockGeneralConstructor = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AboutService,
        {
          provide: getModelToken(AboutTranslation.name),
          useValue: Object.assign(mockTranslationConstructor, {
            findOne: jest.fn(),
          }),
        },
        {
          provide: getModelToken(AboutGeneral.name),
          useValue: Object.assign(mockGeneralConstructor, {
            findOne: jest.fn(),
            findById: jest.fn(),
          }),
        },
        {
          provide: 'IStorageService',
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<AboutService>(AboutService);
    mockTranslationModel = module.get(getModelToken(AboutTranslation.name));
    mockGeneralModel = module.get(getModelToken(AboutGeneral.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByLocale', () => {
    const mockLocale = 'en';
    const mockTranslation = {
      locale: 'en',
      fullName: 'John Doe',
      role: 'Full Stack Developer',
      bio: 'Passionate about clean code and good architecture.',
      generalInfo: 'mock-general-id',
    };

    const mockGeneral = {
      image: {
        publicId: 'some-public-id',
        url: 'https://some-storage.com/photo.jpg',
      },
      socialLinks: {
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    };

    it('should return merged about info if both documents are found', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockTranslation),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockGeneral),
      });

      const result = await service.getByLocale(mockLocale);

      expect(result).toEqual({
        locale: mockTranslation.locale,
        fullName: mockTranslation.fullName,
        role: mockTranslation.role,
        bio: mockTranslation.bio,
        image: mockGeneral.image.url,
        socialLinks: mockGeneral.socialLinks,
      });
    });

    it('should throw NotFoundException if translation is not found', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getByLocale(mockLocale)).rejects.toThrow(
        new NotFoundException(`No about found for locale "${mockLocale}"`),
      );
    });

    it('should throw NotFoundException if general info is not found', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockTranslation),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getByLocale(mockLocale)).rejects.toThrow(
        new NotFoundException('General about info not found'),
      );
    });
  });

  describe('createByLocale', () => {
    const mockDto: CreateAboutDto = {
      locale: 'en',
      fullName: 'John Doe',
      role: 'Developer',
      bio: 'Bio here',
      socialLinks: {
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    };

    const mockFile: UploadFileParams = {
      fileBuffer: Buffer.from('dummy'),
      filename: 'photo.jpg',
      mimetype: 'image/jpeg',
    };

    it('should throw ConflictException if translation already exists', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(true),
      });

      await expect(service.createByLocale(mockDto, mockFile)).rejects.toThrow(
        new ConflictException(`About info already exists for locale "${mockDto.locale}"`),
      );
    });

    it('should create only translation if general already exists', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      mockGeneralModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: 'some-general-id' }),
      });

      const saveMock = jest.fn();
      mockTranslationConstructor.mockImplementation(() => ({ save: saveMock }));

      await service.createByLocale(mockDto, mockFile);

      expect(saveMock).toHaveBeenCalled();
    });

    it('should upload image and create general + translation if general does not exist', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      mockGeneralModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      (uploadSingle as jest.Mock).mockResolvedValueOnce({
        publicId: '123',
        url: 'http://image.com/photo.jpg',
      });

      const saveGeneralMock = jest.fn().mockResolvedValue({ _id: 'new-general-id' });
      mockGeneralConstructor.mockImplementation(() => ({ save: saveGeneralMock }));

      const saveTranslationMock = jest.fn();
      mockTranslationConstructor.mockImplementation(() => ({ save: saveTranslationMock }));

      await service.createByLocale(mockDto, mockFile);

      expect(uploadSingle).toHaveBeenCalled();
      expect(saveGeneralMock).toHaveBeenCalled();
      expect(saveTranslationMock).toHaveBeenCalled();
    });
  });

  describe('updateByLocale', () => {
    const mockDto: CreateAboutDto = {
      locale: 'en',
      fullName: 'Updated Name',
      role: 'Updated Role',
      bio: 'Updated Bio',
      socialLinks: {
        github: 'https://github.com/updated',
        linkedin: 'https://linkedin.com/in/updated',
      },
    };

    const mockFile: UploadFileParams = {
      fileBuffer: Buffer.from('dummy'),
      filename: 'updated.jpg',
      mimetype: 'image/jpeg',
    };

    it('should throw NotFoundException if translation does not exist', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateByLocale('en', mockDto, mockFile)).rejects.toThrow(
        new NotFoundException(`No about info found for locale "en"`),
      );
    });

    it('should throw NotFoundException if general info does not exist', async () => {
      const saveMock = jest.fn();
      const translationDoc = {
        fullName: '',
        role: '',
        bio: '',
        save: saveMock,
        generalInfo: 'general-id',
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateByLocale('en', mockDto, mockFile)).rejects.toThrow(
        new NotFoundException('General about info not found'),
      );
    });

    it('should update translation and general info without new image', async () => {
      const saveTranslationMock = jest.fn();
      const saveGeneralMock = jest.fn();

      const translationDoc = {
        fullName: '',
        role: '',
        bio: '',
        save: saveTranslationMock,
        generalInfo: 'general-id',
      };

      const generalDoc = {
        socialLinks: {},
        save: saveGeneralMock,
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(generalDoc),
      });

      await service.updateByLocale('en', mockDto, {} as UploadFileParams);

      expect(saveTranslationMock).toHaveBeenCalled();
      expect(saveGeneralMock).toHaveBeenCalled();
    });

    it('should upload image and update general info if new image is provided', async () => {
      const saveTranslationMock = jest.fn();
      const saveGeneralMock = jest.fn();

      const translationDoc = {
        fullName: '',
        role: '',
        bio: '',
        save: saveTranslationMock,
        generalInfo: 'general-id',
      };

      const generalDoc = {
        socialLinks: {},
        save: saveGeneralMock,
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(generalDoc),
      });

      (uploadSingle as jest.Mock).mockResolvedValueOnce({
        publicId: 'uploaded-id',
        url: 'http://image.com/new.jpg',
      });

      await service.updateByLocale('en', mockDto, mockFile);

      expect(uploadSingle).toHaveBeenCalled();
      expect(saveTranslationMock).toHaveBeenCalled();
      expect(saveGeneralMock).toHaveBeenCalled();
    });
  });
});
