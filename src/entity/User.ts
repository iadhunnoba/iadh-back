import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { MinLength, IsNotEmpty, IsEmail } from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  username: string;

  @Column()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

<<<<<<< HEAD
    @Column()
    @IsNotEmpty()
    name: string

    @Column()
    @IsNotEmpty()
    surname: string

    @Column()           // Matricula profesional
    license: string

    @Column()           // Legajo estudiantil
    studentIdNumber: string 

    @Column()           // Materia del estudiante
    subject: string

    @Column()           // Comisión del estudiante
    section: string

    @Column({ select: false })  // Excluye el campo password en las consultas por defecto
    @MinLength(6)
    @IsNotEmpty()
    password: string

    @Column({
        type: "enum",
        enum: ["admin", "user"],
        default: "user"
    })
    @IsNotEmpty()
    role: string; 
=======
  @Column()
  @IsNotEmpty()
  role: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;
>>>>>>> devElias

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  // A la hora de crear el usuario se encriptara la password, este metodo se encarga de encriptar
  hashPassword(): void {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }

<<<<<<< HEAD
    hashPassword(): void {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt)
    }

    checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password)
    }
}
=======
  // A la hora de loguearse se comparara la password ingresada con la password de la base de datos
  checkPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
>>>>>>> devElias
