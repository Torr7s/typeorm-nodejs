import http from 'node:http';
import express from 'express';
import config from 'config';
import cors from 'cors';

import { AppDataSource } from '../typeorm/data-source';

import { Server as OvernightServer } from '@overnightjs/core';

import { SubjectController } from './controllers/subject.controller';
import { SubjectService } from '@/src/services/subject.service';

import { Logger } from '@/src/shared/utils/logger';

const appPort: number = config.get<
  number
>('app.port');

export class Server extends OvernightServer {
  private server?: http.Server;
  private logger: Logger

  constructor(private port: number = appPort) {
    super();
    
    this.logger = Logger.it(this.constructor.name);
  }

  public async initialize(): Promise<void> {
    this.setupExpress();
    this.setupControllers();

    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(express.json())
    this.app.use(
      cors({
        origin: '*'
      })
    );
    this.app.use(
      express.urlencoded({
        extended: true
      })
    );
  }

  private setupControllers(): void {
    const subjectService = new SubjectService();
    
    const subjectController = new SubjectController(subjectService);
    
    this.addControllers([
      subjectController
    ]);
  }

  private async setupDatabase(): Promise<void> {
    await AppDataSource.initialize();
  }

  public async stopServer(): Promise<void> {
    if (this.server) {
      await new Promise(
        (resolve, reject): void => {
          this.server?.close(
            (err: Error): void => {
              if (err) {
                return reject(err);
              }

              resolve(true);
            }
          );
        }
      );
    }
  }

  public startServer(): void {
    this.server = this.app.listen(this.port, (): void => {
      this.logger.info(
        'Successfully listening on port ' + this.port
      );
    });
  } 
}