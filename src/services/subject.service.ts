import { StudentService } from '@/src/services/student.service';

import { CreateSubjectDto } from '@/src/core/domain/dtos/subject.dto';

import { SubjectEntity } from '@/src/shared/infra/typeorm/entities/subject.entity';
import { StudentEntity } from '@/src/shared/infra/typeorm/entities/student.entity';

import { DatabaseValidationError } from '@/src/shared/utils/errors/database.error';

import { ORMSubjectRepository } from '@/src/core/infra/repositories/implementations/subject.repository';
import { SubjectRepository } from '@/src/core/domain/repositories/typeorm/interfaces';

export class SubjectService {
  constructor(
    private repository: SubjectRepository = new ORMSubjectRepository(),
    private studentService: StudentService = new StudentService()
  ) {}

  public async create(data: CreateSubjectDto): Promise<SubjectEntity> {
    const subjectAlreadyExists: SubjectEntity = await this.repository.findByName(data.name);
    
    if (subjectAlreadyExists) {
      throw new DatabaseValidationError(
        'Subject already exists with the given name',
        'DUPLICATED'
      );
    }
    
    return this.repository.create(data);
  }
  
  public async findById(id: string): Promise<SubjectEntity> {
    const subject: SubjectEntity = await this.repository.findById(id);

    if (!subject) {
      throw new DatabaseValidationError(
        'No subject were found',
        'INVALID'
      );
    }

    return subject;
  }
  
  public async createStudentSubjectEnrollment(studentId: string, subjectId: string): Promise<SubjectEntity> {
    const student: StudentEntity = await this.studentService.findById(studentId);
    const subject: SubjectEntity = await this.findById(subjectId);

    const studentAlreadyEnrolledToTheSubject: boolean = student.subjects.some(
      (subject: SubjectEntity) =>
        subject.id === subjectId
    );
    
    if (studentAlreadyEnrolledToTheSubject) {
      throw new DatabaseValidationError(
        'Student already enrolled to this subject',
        'INVALID'
      );
    }
    
    await this.repository.update({
      ...subject,
      enrolledStudents: [
        ...subject.enrolledStudents,
        student
      ]
    });
    
    return this.findById(subjectId);
  }
  
  public async cancelStudentSubjectEnrollment(studentId: string, subjectId: string): Promise<void> {
    const student: StudentEntity = await this.studentService.findById(studentId);
    const subject: SubjectEntity = await this.findById(subjectId);
    
    const isStudentEnrolled: boolean = student.subjects.some(
      (subject: SubjectEntity) =>
        subject.id === subjectId
    );
    
    if (!isStudentEnrolled) {
      throw new DatabaseValidationError(
        'Student is not enrolled in this subject',
        'INVALID'
      );
    }
    
    const studentIndex: number = subject.enrolledStudents.findIndex(
      (student: StudentEntity) =>
        student.id === studentId
    );
    
    subject.enrolledStudents.splice(studentIndex, 1);
    
    await this.repository.update({
      ...subject,
      enrolledStudents: [
        ...subject.enrolledStudents
      ]
    });
  }
}