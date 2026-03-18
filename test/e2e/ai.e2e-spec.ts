/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AiModule } from 'src/domains/ai/ai.module';
import { AI_PROVIDER } from 'src/domains/ai/domain/ai.tokens';

describe('AI Module (e2e)', () => {
  let app: INestApplication;

  const mockProvider = {
    streamText: jest.fn(),
    generateText: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AiModule],
    })
      .overrideProvider(AI_PROVIDER)
      .useValue(mockProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should generate text', async () => {
    const body = { content: 'Hello world' };

    mockProvider.generateText.mockResolvedValue({
      text: 'Mock response for task "Hello world"',
      provider: 'mock',
      model: 'mock-model',
      usage: { inputTokens: 40, outputTokens: 40, totalTokens: 80 },
    });

    const response = await request(app.getHttpServer()).post('/ai/summary').send(body).expect(201);

    expect(response.body).toEqual({
      text: 'Mock response for task "Hello world"',
      provider: 'mock',
      model: 'mock-model',
      usage: { inputTokens: 40, outputTokens: 40, totalTokens: 80 },
    });

    expect(mockProvider.generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        prompt: expect.any(String),
      }),
    );
  });

  it('should stream summary via SSE', (done) => {
    // eslint-disable-next-line @typescript-eslint/require-await
    mockProvider.streamText.mockImplementation(async function* () {
      yield { delta: 'Hello ' };
      yield { delta: 'world' };
      yield { delta: '', done: true };
    });

    const chunks: string[] = [];

    request(app.getHttpServer())
      .get('/ai/summary/stream')
      .query({ content: 'Hello world' })
      .buffer(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .parse((res, cb) => {
        res.on('data', (chunk) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          chunks.push(chunk.toString());
        });

        res.on('end', () => {
          const data = chunks.join('');

          expect(data).toContain('Hello');
          expect(data).toContain('world');

          done();
        });
      })
      .end(() => {});
  });
});
