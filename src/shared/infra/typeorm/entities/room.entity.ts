import { randomUUID } from 'node:crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  JoinTableOptions,
  ManyToMany,
  ObjectLiteral,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';

import { SpecificationEntity } from './specification.entity';
import { SubjectEntity } from './subject.entity';

const roomsSpecificationsJoinTable: JoinTableOptions = {
  name: 'rooms_specifications',
  joinColumn: {
    name: 'room_id',
    referencedColumnName: 'id'
  },
  inverseJoinColumn: {
    name: 'specification_id',
    referencedColumnName: 'id'
  }
}

@Entity('rooms')
export class RoomEntity implements ObjectLiteral {
  @PrimaryColumn({ type: 'uuid' })
  id?: string;

  @Column({ type: 'integer' })
  number: number;
  
  @Column({ type: 'integer', default: 40 })
  capacity?: number;

  @ManyToMany(() => SpecificationEntity, {
    cascade: true,
    onDelete: 'SET NULL'
  })
  @JoinTable(roomsSpecificationsJoinTable)
  specifications?: SpecificationEntity[];
  
  @OneToOne(() => SubjectEntity, (subject) => subject.room)
  subject?: SubjectEntity;
  
  @CreateDateColumn()
  createdAt?: Date;
  
  @UpdateDateColumn()
  updatedAt?: Date;
  
  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}