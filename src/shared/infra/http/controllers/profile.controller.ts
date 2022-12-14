import { Request, Response } from 'express';
import {
  Controller,
  Delete,
  Get,
  Middleware,
  Post
} from '@overnightjs/core';

import { BaseController } from './base.controller';

import { ProfileResponse } from '@/src/core/infra/presenters/profile.presenter';
import { ProfileService } from '@/src/services/profile.service';
import { ProfileAccountType } from '@/src/shared/infra/typeorm/entities/profile.entity';

import { CreateProfileDto } from '@/src/core/domain/dtos/profile.dto';

import { AuthMiddleware } from '@/src/shared/infra/http/middlewares/auth.middleware';
import { AccountMiddleware } from '@/src/shared/infra/http/middlewares/account.middleware';

import { paginator } from '@/src/shared/utils/functions/paginator';

/**
 * Represents the main controller class for Profile entity
 */
@Controller('profiles')
export class ProfileController extends BaseController {
  /**
   * Creates a new ProfileController instance
   *
   * @param {ProfileService} service - The profile service instance
   */
  constructor(private service: ProfileService) {
    super();
  }
  
  /**
   * Profile authentication route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Post('auth')
  public async authenticate(request: Request, response: Response): Promise<Response> {
    try {
      const email: string = request.body.email;
      const password: string = request.body.password;
      
      const token: string = await this.service.authenticate(email, password);
      
      return response.status(200).send({ token });
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Profile creation route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Post('')
  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const body: CreateProfileDto = request.body;
      const profile: ProfileResponse = await this.service.create(body);
      
      return response.status(201).send(profile);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Profile deletion route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Delete('')
  @Middleware(AuthMiddleware)
  public async delete(request: Request, response: Response): Promise<Response> {
    try {
      const profileId: string = request.profileId;
      await this.service.delete(profileId);
      
      return response.status(200).send({
        code: 200,
        message: 'Profile successfully deleted'
      });
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Profile listing route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Get('')
  @Middleware([
    AuthMiddleware,
    AccountMiddleware(ProfileAccountType.ADMIN)
  ])
  public async listProfiles(request: Request, response: Response): Promise<Response> {
    try {
      const { skip, take } = paginator(request);
      
      const profiles: ProfileResponse[] = await this.service.list(skip, take);
      
      return response.status(200).send(profiles);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Own profile search route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the request
   * @returns {Promise<Response>}
   */
  @Get('me')
  @Middleware(AuthMiddleware)
  public async me(request: Request, response: Response): Promise<Response> {
    try {
      const profileId: string = request.profileId;
      const profile: ProfileResponse = await this.service.findById(profileId);
      
      return response.status(200).send(profile);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
}