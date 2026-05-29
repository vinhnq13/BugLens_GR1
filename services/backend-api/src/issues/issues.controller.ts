import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { GetIssuesDto } from './dto/get-issues.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignIssueDto } from './dto/assign-issue.dto';
import { AddCommentDto } from './dto/add-comment.dto';

/**
 * IssuesController maps HTTP routes to IssuesService methods.
 *
 * All routes are under the global prefix /api/v1 set in main.ts,
 * so the full paths are:
 *   POST   /api/v1/issues
 *   GET    /api/v1/issues
 *   GET    /api/v1/issues/:id
 *   PATCH  /api/v1/issues/:id/status
 *   PATCH  /api/v1/issues/:id/assign
 *   POST   /api/v1/issues/:id/comments
 *   POST   /api/v1/issues/:id/analyze      ← NEW (Mission 5)
 *   GET    /api/v1/issues/:id/ai-analysis  ← NEW (Mission 5)
 */
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  // ── POST /issues ───────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createIssue(@Body() dto: CreateIssueDto) {
    const data = await this.issuesService.createIssue(dto);
    return {
      success: true,
      message: 'Issue created successfully',
      data,
    };
  }

  // ── GET /issues ────────────────────────────────────────────────────────────

  @Get()
  async getIssues(@Query() filters: GetIssuesDto) {
    const data = await this.issuesService.getIssues(filters);
    return {
      success: true,
      message: 'Issues retrieved successfully',
      data,
    };
  }

  // ── GET /issues/:id ────────────────────────────────────────────────────────

  @Get(':id')
  async getIssueById(@Param('id') id: string) {
    const data = await this.issuesService.getIssueById(id);
    return {
      success: true,
      message: 'Issue retrieved successfully',
      data,
    };
  }

  // ── PATCH /issues/:id/status ───────────────────────────────────────────────

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const data = await this.issuesService.updateStatus(id, dto);
    return {
      success: true,
      message: 'Issue status updated successfully',
      data,
    };
  }

  // ── PATCH /issues/:id/assign ───────────────────────────────────────────────

  @Patch(':id/assign')
  async assignIssue(
    @Param('id') id: string,
    @Body() dto: AssignIssueDto,
  ) {
    const data = await this.issuesService.assignIssue(id, dto);
    return {
      success: true,
      message: 'Issue assigned successfully',
      data,
    };
  }

  // ── POST /issues/:id/comments ────────────────────────────────────────────────────────

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
  ) {
    const data = await this.issuesService.addComment(id, dto);
    return {
      success: true,
      message: 'Comment added successfully',
      data,
    };
  }

  // ── POST /issues/:id/analyze ────────────────────────────────────────────────────────

  @Post(':id/analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeIssue(@Param('id') id: string) {
    const data = await this.issuesService.analyzeIssue(id);
    return {
      success: true,
      message: 'Issue analyzed successfully',
      data,
    };
  }

  // ── GET /issues/:id/ai-analysis ─────────────────────────────────────────────────────

  @Get(':id/ai-analysis')
  async getAiAnalysis(@Param('id') id: string) {
    const data = await this.issuesService.getAiAnalysis(id);
    return {
      success: true,
      message: data ? 'AI analysis retrieved successfully' : 'No AI analysis found for this issue',
      data,
    };
  }
}
