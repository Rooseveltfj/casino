import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

/**
 * Back-office endpoints.
 * All routes require at minimum the 'admin' role.
 * Superadmin-only routes are annotated individually.
 */
@ApiTags('admin')
@ApiBearerAuth()
@Roles('admin', 'superadmin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('psp/pending')
  listPendingDeposits() {
    return this.adminService.listPendingDeposits();
  }

  /** Demo mode: manually confirm a Pix deposit */
  @Post('psp/:id/confirm')
  confirmDeposit(@Param('id') id: string) {
    return this.adminService.confirmDeposit(id);
  }
}
