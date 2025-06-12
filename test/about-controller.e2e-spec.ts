/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AboutModule } from '../src/domains/portfolio/about/about.module';
import { AboutService } from '../src/domains/portfolio/about/about.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { JwtAuthGuard, RolesGuard } from '../src/common/guards';
import { CreateAboutDto, UpdateAboutDto } from 'src/domains/portfolio/about/dtos';
import { AboutGeneral, AboutTranslation } from 'src/domains/portfolio/about/schemas';

describe('AboutController (e2e)', () => {
  let app: INestApplication;

  const mockService = {
    getByLocale: jest.fn(),
    createByLocale: jest.fn(),
    updateByLocale: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AboutModule],
    })
      .overrideProvider(AboutService)
      .useValue(mockService)
      .overrideProvider(getConnectionToken())
      .useValue({})
      .overrideProvider(getModelToken(AboutGeneral.name, 'portfolio'))
      .useValue({})
      .overrideProvider(getModelToken(AboutTranslation.name, 'portfolio'))
      .useValue({})
      .overrideProvider('IStorageService')
      .useValue({})
      // 👇 Override guards to bypass auth/roles
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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
        image: 'image-url',
        cv: 'cv-url',
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
    it('should create about with files and return response', async () => {
      const dto: CreateAboutDto = {
        locale: 'en',
        fullName: 'Jane Doe',
        title: 'Engineer',
        bio: 'Updated bio',
        positioningTags: ['fullstack', 'nestjs'],
      };

      const mockResponse = { success: true };
      mockService.createByLocale.mockResolvedValue(mockResponse);

      const res = await request(app.getHttpServer())
        .post('/portfolio/about')
        .field('locale', dto.locale)
        .field('fullName', dto.fullName)
        .field('title', dto.title)
        .field('bio', dto.bio)
        .field('positioningTags', JSON.stringify(dto.positioningTags))
        .attach('image', Buffer.from('image buffer'), {
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
        })
        .attach('cv', Buffer.from('cv buffer'), {
          filename: 'resume.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockResponse);

      expect(mockService.createByLocale).toHaveBeenCalledWith(
        expect.objectContaining({
          ...dto,
          positioningTags: JSON.stringify(dto.positioningTags),
        }),
        expect.objectContaining({
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
        }),
        expect.objectContaining({
          originalname: 'resume.pdf',
          mimetype: 'application/pdf',
        }),
      );
    });
  });

  describe('PATCH /portfolio/about/:locale', () => {
    it('should update about info and return it', async () => {
      const dto: UpdateAboutDto = {
        fullName: 'Updated',
        title: 'Senior Dev',
        bio: 'Bio updated',
        positioningTags: ['team lead', 'backend'],
      };

      const mockResponse = { updated: true };
      mockService.updateByLocale.mockResolvedValue(mockResponse);

      const res = await request(app.getHttpServer())
        .patch('/portfolio/about/en')
        .field('fullName', dto.fullName!)
        .field('title', dto.title!)
        .field('bio', dto.bio!)
        .field('positioningTags', JSON.stringify(dto.positioningTags))
        .attach('image', Buffer.from('image buffer'), {
          filename: 'new.jpg',
          contentType: 'image/jpeg',
        })
        .attach('cv', Buffer.from('new cv buffer'), {
          filename: 'resume.docx',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
      expect(mockService.updateByLocale).toHaveBeenCalledWith(
        'en',
        expect.objectContaining({
          ...dto,
          positioningTags: JSON.stringify(dto.positioningTags),
        }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should return 400 if image type is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/portfolio/about')
        .field('locale', 'en')
        .field('fullName', 'Bad File')
        .field('role', 'Role')
        .field('bio', 'Bio')
        .attach('image', Buffer.from('invalid'), {
          filename: 'test.svg',
          contentType: 'image/svg+xml',
        });

      expect(res.status).toBe(400);
    });
  });
});
