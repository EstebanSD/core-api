/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AboutService } from './about.service';
import { AboutGeneral, AboutTranslation } from './schemas';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateAboutDto, UpdateAboutDto } from './dtos';

describe('AboutService', () => {
  let service: AboutService;
  let mockTranslationModel: any;
  let mockGeneralModel: any;
  let mockTranslationConstructor: jest.Mock;
  let mockGeneralConstructor: jest.Mock;
  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    mockTranslationConstructor = jest.fn();
    mockGeneralConstructor = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AboutService,
        {
          provide: getModelToken(AboutTranslation.name, 'portfolio'),
          useValue: Object.assign(mockTranslationConstructor, {
            findOne: jest.fn(),
          }),
        },
        {
          provide: getModelToken(AboutGeneral.name, 'portfolio'),
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
    mockTranslationModel = module.get(getModelToken(AboutTranslation.name, 'portfolio'));
    mockGeneralModel = module.get(getModelToken(AboutGeneral.name, 'portfolio'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByLocale', () => {
    const mockLocale = 'en';
    const mockTranslation = {
      locale: 'en',
      title: 'Software Developer',
      bio: 'Passionate about clean code and good architecture.',
      tagline: 'Building the future, one line at a time',
      cv: {
        publicId: 'cv-public-id',
        url: 'https://storage.com/cv.pdf',
      },
      general: 'mock-general-id',
    };

    const mockGeneral = {
      fullName: 'John Doe',
      birthYear: 1990,
      location: 'New York, USA',
      image: {
        publicId: 'some-public-id',
        url: 'https://some-storage.com/photo.jpg',
      },
      positioningTags: ['Full Stack', 'JavaScript', 'React'],
    };

    it('should return merged about info if both documents are found', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(mockTranslation),
        }),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(mockGeneral),
        }),
      });

      const result = await service.getByLocale(mockLocale);

      expect(result).toEqual({
        locale: mockTranslation.locale,
        title: mockTranslation.title,
        bio: mockTranslation.bio,
        tagline: mockTranslation.tagline,
        cv: mockTranslation.cv,
        general: mockGeneral,
      });
    });

    it('should throw NotFoundException if translation is not found', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getByLocale(mockLocale)).rejects.toThrow(
        new NotFoundException(`No about found for locale "${mockLocale}"`),
      );
    });

    it('should throw NotFoundException if general info is not found', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(mockTranslation),
        }),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getByLocale(mockLocale)).rejects.toThrow(
        new NotFoundException('General about info not found'),
      );
    });
  });

  describe('createByLocale', () => {
    const mockDto: CreateAboutDto = {
      locale: 'en',
      title: 'Software Developer',
      bio: 'Bio here',
      tagline: 'Building amazing things',
      fullName: 'John Doe',
      birthYear: 1990,
      location: 'New York, USA',
      positioningTags: ['Full Stack', 'JavaScript'],
    };

    const mockImageFile: Express.Multer.File = {
      buffer: Buffer.from('dummy-image'),
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      fieldname: 'image',
      size: 1234,
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const mockCvFile: Express.Multer.File = {
      buffer: Buffer.from('dummy-cv'),
      originalname: 'cv.pdf',
      mimetype: 'application/pdf',
      fieldname: 'cv',
      size: 5678,
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should throw ConflictException if translation already exists', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(true),
        }),
      });

      await expect(service.createByLocale(mockDto, mockImageFile, mockCvFile)).rejects.toThrow(
        new ConflictException(`About info already exists for locale "${mockDto.locale}"`),
      );
    });

    it('should create only translation if general already exists', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const existingGeneral = {
        _id: 'existing-general-id',
        toObject: () => ({
          fullName: 'Existing Name',
          birthYear: 1985,
          location: 'Existing Location',
          image: {
            publicId: 'existing-id',
            url: 'https://existing.com/image.jpg',
          },
          positioningTags: ['Existing', 'Tags'],
        }),
      };

      mockGeneralModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(existingGeneral),
      });

      mockStorageService.uploadFile.mockResolvedValueOnce({
        publicId: 'cv-123',
        url: 'http://storage.com/cv.pdf',
      });

      const mockTranslationDoc = {
        toObject: () => ({
          locale: mockDto.locale,
          title: mockDto.title,
          bio: mockDto.bio,
          tagline: mockDto.tagline,
          cv: {
            publicId: 'cv-123',
            url: 'http://storage.com/cv.pdf',
          },
          general: 'existing-general-id',
        }),
        save: jest.fn(),
      };
      mockTranslationConstructor.mockImplementation(() => mockTranslationDoc);

      const result = await service.createByLocale(mockDto, undefined, mockCvFile);

      expect(mockTranslationDoc.save).toHaveBeenCalled();
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith({
        fileBuffer: mockCvFile.buffer,
        filename: mockCvFile.originalname,
        mimetype: mockCvFile.mimetype,
        folder: 'portfolio/about',
      });
      expect(result).toEqual({
        locale: mockDto.locale,
        title: mockDto.title,
        bio: mockDto.bio,
        tagline: mockDto.tagline,
        cv: {
          publicId: 'cv-123',
          url: 'http://storage.com/cv.pdf',
        },
        general: existingGeneral.toObject(),
      });
    });

    it('should create general + translation if general does not exist', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      mockGeneralModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockStorageService.uploadFile
        .mockResolvedValueOnce({
          publicId: 'image-123',
          url: 'http://storage.com/photo.jpg',
        })
        .mockResolvedValueOnce({
          publicId: 'cv-123',
          url: 'http://storage.com/cv.pdf',
        });

      const generalDocMock = {
        _id: 'new-general-id',
        toObject: () => ({
          fullName: mockDto.fullName,
          birthYear: mockDto.birthYear,
          location: mockDto.location,
          image: {
            publicId: 'image-123',
            url: 'http://storage.com/photo.jpg',
          },
          positioningTags: mockDto.positioningTags,
        }),
        save: jest.fn().mockResolvedValue({ _id: 'new-general-id' }),
      };
      mockGeneralConstructor.mockImplementation(() => generalDocMock);

      const translationDocMock = {
        toObject: () => ({
          locale: mockDto.locale,
          title: mockDto.title,
          bio: mockDto.bio,
          tagline: mockDto.tagline,
          cv: {
            publicId: 'cv-123',
            url: 'http://storage.com/cv.pdf',
          },
          general: 'new-general-id',
        }),
        save: jest.fn(),
      };
      mockTranslationConstructor.mockImplementation(() => translationDocMock);

      await service.createByLocale(mockDto, mockImageFile, mockCvFile);

      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
      expect(generalDocMock.save).toHaveBeenCalled();
      expect(translationDocMock.save).toHaveBeenCalled();
    });

    it('should create without files if none provided', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        lean: () => ({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      mockGeneralModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      const generalDocMock = {
        _id: 'new-general-id',
        toObject: () => ({
          fullName: mockDto.fullName,
          birthYear: mockDto.birthYear,
          location: mockDto.location,
          image: null,
          positioningTags: mockDto.positioningTags,
        }),
        save: jest.fn().mockResolvedValue({ _id: 'new-general-id' }),
      };
      mockGeneralConstructor.mockImplementation(() => generalDocMock);

      const translationDocMock = {
        toObject: () => ({
          locale: mockDto.locale,
          title: mockDto.title,
          bio: mockDto.bio,
          tagline: mockDto.tagline,
          cv: null,
          general: 'new-general-id',
        }),
        save: jest.fn(),
      };
      mockTranslationConstructor.mockImplementation(() => translationDocMock);

      await service.createByLocale(mockDto);

      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
      expect(generalDocMock.save).toHaveBeenCalled();
      expect(translationDocMock.save).toHaveBeenCalled();
    });
  });

  describe('updateByLocale', () => {
    const mockDto: UpdateAboutDto = {
      title: 'Updated Title',
      bio: 'Updated Bio',
      tagline: 'Updated Tagline',
      fullName: 'Updated Name',
      birthYear: 1992,
      location: 'Updated Location',
      positioningTags: ['Updated', 'Tags'],
    };

    const mockImageFile: Express.Multer.File = {
      buffer: Buffer.from('dummy-image'),
      originalname: 'new-photo.jpg',
      mimetype: 'image/jpeg',
      fieldname: 'image',
      size: 1234,
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const mockCvFile: Express.Multer.File = {
      buffer: Buffer.from('dummy-cv'),
      originalname: 'new-cv.pdf',
      mimetype: 'application/pdf',
      fieldname: 'cv',
      size: 5678,
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should throw NotFoundException if translation does not exist', async () => {
      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateByLocale('en', mockDto, mockImageFile, mockCvFile),
      ).rejects.toThrow(new NotFoundException(`No about info found for locale "en"`));
    });

    it('should throw NotFoundException if general info does not exist', async () => {
      const translationDoc = {
        title: 'Old Title',
        bio: 'Old Bio',
        tagline: 'Old Tagline',
        cv: null,
        save: jest.fn(),
        general: 'general-id',
        toObject: () => ({}),
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateByLocale('en', mockDto, mockImageFile, mockCvFile),
      ).rejects.toThrow(new NotFoundException('General about info not found'));
    });

    it('should update translation and general info without new files', async () => {
      const saveTranslationMock = jest.fn();
      const saveGeneralMock = jest.fn();

      const translationDoc = {
        title: 'Old Title',
        bio: 'Old Bio',
        tagline: 'Old Tagline',
        cv: null,
        save: saveTranslationMock,
        general: 'general-id',
        toObject: () => ({
          title: mockDto.title,
          bio: mockDto.bio,
          tagline: mockDto.tagline,
          cv: null,
          general: 'general-id',
        }),
      };

      const generalDoc = {
        fullName: 'Old Name',
        birthYear: 1990,
        location: 'Old Location',
        image: null,
        positioningTags: ['Old', 'Tags'],
        save: saveGeneralMock,
        toObject: () => ({
          fullName: mockDto.fullName,
          birthYear: mockDto.birthYear,
          location: mockDto.location,
          image: null,
          positioningTags: mockDto.positioningTags,
        }),
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(generalDoc),
      });

      await service.updateByLocale('en', mockDto);

      expect(saveTranslationMock).toHaveBeenCalled();
      expect(saveGeneralMock).toHaveBeenCalled();
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should upload new files and delete old ones when provided', async () => {
      const saveTranslationMock = jest.fn();
      const saveGeneralMock = jest.fn();

      const translationDoc = {
        title: 'Old Title',
        bio: 'Old Bio',
        tagline: 'Old Tagline',
        cv: {
          publicId: 'old-cv-id',
          url: 'https://old-cv.com/cv.pdf',
        },
        save: saveTranslationMock,
        general: 'general-id',
        toObject: () => ({
          title: mockDto.title,
          bio: mockDto.bio,
          tagline: mockDto.tagline,
          cv: {
            publicId: 'new-cv-123',
            url: 'http://storage.com/new-cv.pdf',
          },
          general: 'general-id',
        }),
      };

      const generalDoc = {
        fullName: 'Old Name',
        birthYear: 1990,
        location: 'Old Location',
        image: {
          publicId: 'old-image-id',
          url: 'https://old-image.com/photo.jpg',
        },
        positioningTags: ['Old', 'Tags'],
        save: saveGeneralMock,
        toObject: () => ({
          fullName: mockDto.fullName,
          birthYear: mockDto.birthYear,
          location: mockDto.location,
          image: {
            publicId: 'new-image-123',
            url: 'http://storage.com/new-photo.jpg',
          },
          positioningTags: mockDto.positioningTags,
        }),
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(generalDoc),
      });

      mockStorageService.uploadFile
        .mockResolvedValueOnce({
          publicId: 'new-cv-123',
          url: 'http://storage.com/new-cv.pdf',
        })
        .mockResolvedValueOnce({
          publicId: 'new-image-123',
          url: 'http://storage.com/new-photo.jpg',
        });

      await service.updateByLocale('en', mockDto, mockImageFile, mockCvFile);

      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('old-cv-id');
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('old-image-id');
      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
      expect(saveTranslationMock).toHaveBeenCalled();
      expect(saveGeneralMock).toHaveBeenCalled();
    });

    it('should handle partial updates with pickDefined utility', async () => {
      const saveTranslationMock = jest.fn();
      const saveGeneralMock = jest.fn();

      const partialDto = {
        title: 'Only Title Updated',
        fullName: 'Only Name Updated',
      };

      const translationDoc = {
        title: 'Old Title',
        bio: 'Old Bio',
        tagline: 'Old Tagline',
        cv: null,
        save: saveTranslationMock,
        general: 'general-id',
        toObject: () => ({
          title: partialDto.title,
          bio: 'Old Bio', // Should remain unchanged
          tagline: 'Old Tagline', // Should remain unchanged
          cv: null,
          general: 'general-id',
        }),
      };

      const generalDoc = {
        fullName: 'Old Name',
        birthYear: 1990,
        location: 'Old Location',
        image: null,
        positioningTags: ['Old', 'Tags'],
        save: saveGeneralMock,
        toObject: () => ({
          fullName: partialDto.fullName,
          birthYear: 1990, // Should remain unchanged
          location: 'Old Location', // Should remain unchanged
          image: null,
          positioningTags: ['Old', 'Tags'], // Should remain unchanged
        }),
      };

      mockTranslationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(translationDoc),
      });

      mockGeneralModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(generalDoc),
      });

      await service.updateByLocale('en', partialDto);

      expect(saveTranslationMock).toHaveBeenCalled();
      expect(saveGeneralMock).toHaveBeenCalled();
    });
  });
});
