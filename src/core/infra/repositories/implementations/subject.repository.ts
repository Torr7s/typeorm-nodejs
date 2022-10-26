import { EntityTarget } from 'typeorm';

import { SubjectDto } from '@/src/core/domain/dtos/subject.dto';
import { SubjectRepository } from '@/src/core/domain/repositories/typeorm/subject/subject.repository';
import { SubjectEntity } from '@/src/shared/infra/typeorm/entities/subject.entity';

import { TypeORMRepository } from '@/src/core/domain/repositories/typeorm/typeorm.repository';

export class ORMSubjectRepository extends TypeORMRepository<SubjectEntity, SubjectDto> implements SubjectRepository {
  constructor(private entity: EntityTarget<SubjectEntity> = SubjectEntity) {
    super(entity);
  }

  public async findById(id: string): Promise<SubjectEntity> {
    return this.find({
      where: {
        id
      }
    });
  }

  public async findByName(name: string): Promise<SubjectEntity> {
    return this.find({
      where: {
        name
      }
    });
  }
}