import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class NoteIDPathParam {
    @IsUUID('4')
    id: string;
}

export class RetrieveNoteQueryParams {
    @IsBoolean()
    @IsOptional()
    encrypted?: boolean;
}

export class CreateOrUpdateNoteBodyParams {
    @IsString()
    @IsNotEmpty()
    content: string;
}
