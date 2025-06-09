/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AboutModule } from 'src/domains/portfolio/about/about.module';
import { AboutService } from 'src/domains/portfolio/about/about.service';
import { CreateAboutDto, UpdateAboutDto } from 'src/domains/portfolio/about/dtos';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AboutGeneral, AboutTranslation } from 'src/domains/portfolio/schemas/about.schema';

describe('AboutController (e2e)', () => {
  let app: INestApplication;

  // AboutService
  const mockService = {
    getByLocale: jest.fn(),
    createByLocale: jest.fn(),
    updateByLocale: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AboutModule],
    })
      // Override the AboutService with a mock
      .overrideProvider(AboutService)
      .useValue(mockService)

      // Mock the Mongoose connection and models
      .overrideProvider(getConnectionToken())
      .useValue({})

      // Mock the models used in AboutService
      .overrideProvider(getModelToken(AboutGeneral.name))
      .useValue({})
      .overrideProvider(getModelToken(AboutTranslation.name))
      .useValue({})

      // Mock the storage service
      .overrideProvider('IStorageService')
      .useValue({})

      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /portfolio/about/:locale', () => {
    it('should return about info for given locale', async () => {
      const responseMock = {
        locale: 'en',
        fullName: 'John Doe',
        role: 'Dev',
        bio: 'About me',
        image: 'url',
        socialLinks: { github: 'x', linkedin: 'y' },
      };

      mockService.getByLocale.mockResolvedValue(responseMock);

      const res = await request(app.getHttpServer()).get('/portfolio/about/en');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(responseMock);
      expect(mockService.getByLocale).toHaveBeenCalledWith('en');
    });
  });

  describe('POST /portfolio/about', () => {
    it('should create about with image and return it', async () => {
      const dto: CreateAboutDto = {
        locale: 'en',
        fullName: 'Jane Doe',
        role: 'Engineer',
        bio: 'Updated bio',
        socialLinks: { github: 'x', linkedin: 'y' },
      };

      const mockResponse = { success: true };
      mockService.createByLocale.mockResolvedValue(mockResponse);

      const res = await request(app.getHttpServer())
        .post('/portfolio/about')
        .field('locale', dto.locale)
        .field('fullName', dto.fullName)
        .field('role', dto.role)
        .field('bio', dto.bio)
        .field('socialLinks[github]', dto.socialLinks!.github!)
        .field('socialLinks[linkedin]', dto.socialLinks!.linkedin!)
        .attach('file', Buffer.from('test'), {
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockResponse);
      expect(mockService.createByLocale).toHaveBeenCalledWith(
        expect.objectContaining(dto),
        expect.objectContaining({
          buffer: expect.any(Buffer),
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
        }),
      );
    });
  });

  describe('PATCH /portfolio/about/:locale', () => {
    it('should update about info and return it', async () => {
      const dto: UpdateAboutDto = {
        fullName: 'Updated',
        role: 'Senior Dev',
        bio: 'Bio updated',
        socialLinks: { github: 'x', linkedin: 'y' },
      };

      const mockResponse = { updated: true };
      mockService.updateByLocale.mockResolvedValue(mockResponse);

      const res = await request(app.getHttpServer())
        .patch('/portfolio/about/en')
        .field('fullName', dto.fullName!)
        .field('role', dto.role!)
        .field('bio', dto.bio!)
        .field('socialLinks[github]', dto.socialLinks!.github!)
        .field('socialLinks[linkedin]', dto.socialLinks!.linkedin!)
        .attach('file', Buffer.from('test'), {
          filename: 'new.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
      expect(mockService.updateByLocale).toHaveBeenCalledWith(
        'en',
        expect.objectContaining(dto),
        expect.any(Object),
      );
    });

    it('should return 400 if uploaded file is not an image', async () => {
      const res = await request(app.getHttpServer())
        .post('/portfolio/about')
        .field('locale', 'en')
        .attach('file', Buffer.from('not an image'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
    });
  });
});
