import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Middleware,
  Post
} from '@overnightjs/core';

import { BaseController } from './base.controller';

import { SubjectEntity } from '@/src/shared/infra/typeorm/entities/subject.entity';
import { SubjectService } from '@/src/services/subject.service';

import { CreateSubjectDto } from '@/src/core/domain/dtos/subject.dto';

import { AuthMiddleware } from '@/src/shared/infra/http/middlewares/auth.middleware';

@Controller('subjects')
export class SubjectController extends BaseController {
  constructor(private service: SubjectService) {
    super();
  }

  @Get(':id')
  public async get(request: Request, response: Response): Promise<Response> {
    try {
      const subject: SubjectEntity = await this.service.findById(request.params.id);

      return response.status(200).send(subject);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }

  @Post('')
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const subject: CreateSubjectDto = request.body;
      
      const subjectRecord: SubjectEntity = await this.service.create(subject);

      return response.status(201).send(subjectRecord);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  @Post('enroll/:subjectId')
  @Middleware(AuthMiddleware)
  public async enrollStudent(request: Request, response: Response): Promise<Response> {
    try {
      const studentId = request.userId;
      const subjectId = request.params.subjectId;
      
      const enroll = await this.service.enrollStudent(studentId, subjectId);
      
      return response.status(201).send(enroll);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
}