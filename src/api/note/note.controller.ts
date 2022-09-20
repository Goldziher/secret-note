import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { NoteService, SanitizedNote } from './note.service';
import {
    CreateOrUpdateNoteBodyParams,
    RetrieveNoteQueryParams,
    NoteIDPathParam,
} from '../../params';

const NOTE_ID_PATH_PARAM = ':id';

@Controller('note')
@UseInterceptors(ClassSerializerInterceptor)
export class NoteController {
    constructor(private readonly noteService: NoteService) {}

    @Post()
    async create(
        @Body(new ValidationPipe()) { content }: CreateOrUpdateNoteBodyParams,
    ): Promise<SanitizedNote> {
        return this.noteService.createNote(content);
    }

    @Get(NOTE_ID_PATH_PARAM)
    async retrieve(
        @Param(new ValidationPipe()) { id }: NoteIDPathParam,
        @Query() { encrypted = false }: RetrieveNoteQueryParams,
    ): Promise<SanitizedNote> {
        return this.noteService.retrieveNote(id, encrypted);
    }

    @Patch(NOTE_ID_PATH_PARAM)
    async update(
        @Param(new ValidationPipe()) { id }: NoteIDPathParam,
        @Body(new ValidationPipe()) { content }: CreateOrUpdateNoteBodyParams,
    ): Promise<SanitizedNote> {
        return this.noteService.updateNote(id, content);
    }

    @Delete(NOTE_ID_PATH_PARAM)
    @HttpCode(HttpStatus.NO_CONTENT)
    async destroy(
        @Param(new ValidationPipe()) { id }: NoteIDPathParam,
    ): Promise<void> {
        await this.noteService.destroyNote(id);
    }
}
