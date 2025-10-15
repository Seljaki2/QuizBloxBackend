import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { type FirebasePayload, GetPayload } from 'src/auth/get-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor (
    private readonly usersService: UsersService
  ) {}

  @Get()
  async getAll() {

    return {
      users: await this.usersService.getAll()
    }
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getMe(
    @GetPayload() payload: FirebasePayload
  ) {
    return await this.usersService.getById(payload.uid)
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createUser(
    @GetPayload() payload: FirebasePayload,
    @Body() createUserDto: CreateUserDto
  ) {
    const { uid, email } = payload

    await this.usersService.create({
      ...createUserDto,
      id: uid,
      email: email!,
      isAdmin: false
    })

    return await this.usersService.getById(uid)
  }

  @Put()
  @UseGuards(FirebaseAuthGuard)
  async updateSelf(
    @GetPayload() payload: FirebasePayload,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const { uid } = payload
    await this.usersService.update(uid, updateUserDto)
    return await this.usersService.getById(uid)
  }

  @Delete()
  @UseGuards(FirebaseAuthGuard)
  async deleteSelf(
    @GetPayload() payload: FirebasePayload,
  ) {
    const { uid } = payload
    return await this.usersService.deleteUser(uid)
  }
}
