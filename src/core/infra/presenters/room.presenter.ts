import { RoomEntity } from '@/src/shared/infra/typeorm/entities/room.entity';

export interface RoomResponse extends RoomEntity {}

export class RoomPresenter {
  public static handleSingleInstance(room: RoomEntity): RoomResponse {
    return {
      ...{
        id: room.id,
        number: room.number,
        capacity: room.capacity,
        specifications: room.specifications
      },
      ...(
        room.subject && {
          subject: room.subject
        }
      ),
      ...{
        createdAt: room.createdAt,
        updatedAt: room.createdAt
      }
    }
  }
  
  public static handleMultipleInstances(rooms: RoomEntity[]): RoomResponse[] {
    return rooms.map(RoomPresenter.handleSingleInstance);
  }
}