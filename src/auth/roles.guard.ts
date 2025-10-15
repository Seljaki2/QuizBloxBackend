import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "src/users/users.service";
import { IsAdmin } from "./admin.decorator";
import { FirebaseService } from "src/firebase/firebase.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const adminRequired = this.reflector.get(IsAdmin, context.getHandler());
    if (!adminRequired)
      return true;

    const request = context.switchToHttp().getRequest();
        const authHeader: string | undefined = request.headers?.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) 
      throw new UnauthorizedException('Authorization header is missing or invalid');
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);

    const { uid } = decodedToken;
    const user = await this.usersService.getById(uid)

    if(!user)
      throw new NotFoundException(`User with id ${uid} doesn't exist!`)

    return user.isAdmin
  }
}