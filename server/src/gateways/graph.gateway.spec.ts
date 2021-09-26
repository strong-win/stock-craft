import { Test, TestingModule } from '@nestjs/testing';
import { GraphGateway } from './graph.gateway';

describe('GraphGateway', () => {
  let gateway: GraphGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphGateway],
    }).compile();

    gateway = module.get<GraphGateway>(GraphGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
