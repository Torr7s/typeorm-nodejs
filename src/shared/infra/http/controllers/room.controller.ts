import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Middleware,
  Post
} from '@overnightjs/core';

import { BaseController } from './base.controller';

import { ProfileAccountType } from '@/src/shared/infra/typeorm/entities/profile.entity';

import { RoomEntity } from '@/src/shared/infra/typeorm/entities/room.entity';
import { RoomService } from '@/src/services/room.service';

import { CreateRoomDto } from '@/src/core/domain/dtos/room.dto';

import { AccountMiddleware } from '@/src/shared/infra/http/middlewares/account.middleware';
import { AuthMiddleware } from '@/src/shared/infra/http/middlewares/auth.middleware';

import { paginator } from '@/src/shared/utils/functions/paginator';

/**
 * Represents the main controller class for Room entity
 */
@Controller('rooms')
export class RoomController extends BaseController {
  /**
   * Creates a new RoomController instance
   *
   * @param {RoomService} service - The room service instance
   */
  constructor(private service: RoomService) {
    super();
  }
  
  /**
   * Room creation route
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
      const body: CreateRoomDto = request.body;
      const room: RoomEntity = await this.service.create(body);
      
      return response.status(201).send(room);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Room search route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the incoming request
   * @returns {Promise<Response>}
   */
  @Get(':id')
  @Middleware([
    AuthMiddleware,
    AccountMiddleware(ProfileAccountType.ADMIN)
  ])
  public async getOne(request: Request, response: Response): Promise<Response> {
    try {
      const roomId: string = request.params.id;
      const room: RoomEntity = await this.service.findById(roomId);
      
      return response.status(200).send(room);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
  
  /**
   * Room listing route
   *
   * @param {Request} request - The incoming request
   * @param {Response} response - The response to the incoming request
   * @returns {Promise<Response>}
   */
  @Get('')
  @Middleware([
    AuthMiddleware,
    AccountMiddleware(ProfileAccountType.ADMIN)
  ])
  public async listRooms(request: Request, response: Response): Promise<Response> {
    try {
      const { skip, take } = paginator(request);
      
      const rooms = await this.service.list(skip, take);
      
      return response.status(200).send(rooms);
    } catch (error) {
      return this.sendErrorResponse(response, error);
    }
  }
}