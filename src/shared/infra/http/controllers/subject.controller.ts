import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Middleware,
  Post
} from '@overnightjs/core';

import { BaseController } from './base.controller';

import { ProfileAccountType } from '@/src/shared/infra/typeorm/entities/profile.entity';
import { SubjectEntity } from '@/src/shared/infra/typeorm/entities/subject.entity';
import { SubjectService } from '@/src/services/subject.service';

import { CreateSubjectDto } from '@/src/core/domain/dtos/subject.dto';

import { AccountMiddleware } from '@/src/shared/infra/http/middlewares/account.middleware';
import { AuthMiddleware } from '@/src/shared/infra/http/middlewares/auth.middleware';

import { paginator } from '@/src/shared/utils/functions/paginator';

/**
 * Represents the main controller class for Subject entity
 */
@Controller('subjects')
export class SubjectController extends BaseController {
  /**
   * Creates a new SubjectController instance
   *
   * @param {SubjectService} service - The subject service instance
   */
  constructor(private service: SubjectService) {
    super();
  }
  
  /**
   * Subject creation route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Post('')
  @Middleware([
    AuthMiddleware,
    AccountMiddleware(ProfileAccountType.ADMIN)
  ])
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const body: CreateSubjectDto = request.body;
      const subjectRecord: SubjectEntity = await this.service.create(body);

      return response.status(201).send(subjectRecord);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Student's enrollment creation route in a subject
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Post('enroll/:subjectId')
  @Middleware([
    AuthMiddleware,
    AccountMiddleware(ProfileAccountType.STUDENT)
  ])
  public async createStudentSubjectEnrollment(request: Request, response: Response): Promise<Response> {
    try {
      const studentId: string = request.profileStudentId;
      const subjectId: string = request.params.subjectId;
      
      const enroll = await this.service.createStudentSubjectEnrollment(studentId, subjectId);
      
      return response.status(201).send(enroll);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Student's enrollment cancellation route in a subject
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Post('enroll/:subjectId/cancel')
  @Middleware([
    AuthMiddleware,
    AccountMiddleware(ProfileAccountType.STUDENT)
  ])
  public async cancelStudentSubjectEnrollment(request: Request, response: Response): Promise<Response> {
    try {
      const studentId: string = request.profileStudentId;
      const subjectId: string = request.params.subjectId;
  
      await this.service.cancelStudentSubjectEnrollment(studentId, subjectId);
  
      return response.status(200).send({
        code: 200,
        message: 'Enrollment successfully canceled'
      });
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Subject search route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Get(':id')
  @Middleware(AuthMiddleware)
  public async getOne(request: Request, response: Response): Promise<Response> {
    try {
      const subjectId: string = request.params.id;
      const subject: SubjectEntity = await this.service.findById(subjectId);
      
      return response.status(200).send(subject);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Subject listing route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Get('')
  @Middleware(AuthMiddleware)
  public async listSubjects(request: Request, response: Response): Promise<Response> {
    try {
      const { skip, take } = paginator(request);
      
      const rooms = await this.service.list(skip, take);
      
      return response.status(200).send(rooms);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
}