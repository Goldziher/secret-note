import {
    BadRequestException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { Note } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
    decrypt,
    encrypt,
    getCryptographicKeyOrThrow,
    getOrCreateCryptographicKey,
} from '../../utils';

function sanitize(note: Note): Omit<Note, 'initializationVector'> {
    return {
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
    };
}

export type SanitizedNote = Omit<Note, 'initializationVector'>;

@Injectable()
export class NoteService {
    private readonly logger = new Logger(NoteService.name);

    constructor(private prisma: PrismaService) {}

    async createNote(content: string): Promise<SanitizedNote> {
        const note = await this.prisma.note.create({
            data: {
                content: '',
                initializationVector: '',
            },
        });
        const result = await this.encryptAndSaveNote(note, content);
        return sanitize(result);
    }

    async retrieveNote(id: string, encrypted: boolean): Promise<SanitizedNote> {
        const note = await this.findNoteOrBadRequest(id);
        if (encrypted) {
            return note;
        }
        try {
            const key = await getCryptographicKeyOrThrow(id);
            const { content, initializationVector } = note;
            note.content = await decrypt({
                content,
                initializationVector,
                key,
            });
            return sanitize(note);
        } catch (e: any) {
            this.logger.error(e.message);
            throw new ServiceUnavailableException(e.message);
        }
    }

    async updateNote(id: string, content: string): Promise<SanitizedNote> {
        const note = await this.findNoteOrBadRequest(id);
        return sanitize(await this.encryptAndSaveNote(note, content));
    }

    async destroyNote(id: string): Promise<void> {
        const note = await this.findNoteOrBadRequest(id);
        await this.prisma.note.delete({ where: { id: note.id } });
    }

    private async findNoteOrBadRequest(id: string): Promise<Note> {
        const note = await this.prisma.note.findFirst({ where: { id } });
        if (!note) {
            throw new BadRequestException('No Note found: Invalid ID');
        }
        return note;
    }

    private async encryptAndSaveNote(
        { id }: Note,
        content: string,
    ): Promise<Note> {
        const key = await getOrCreateCryptographicKey(id);
        const { encryptedContent, initializationVector } = await encrypt({
            content,
            key,
        });
        return await this.prisma.note.update({
            data: {
                content: encryptedContent,
                initializationVector,
            },
            where: { id },
        });
    }
}
