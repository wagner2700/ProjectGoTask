import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IComment } from '../../interfaces/comment.interface';
import { generateUniqueIdWithTimestamp } from '../../utils/generate-unique-id-with-timestamp';
import { ITask } from '../../interfaces/task.interface';

@Component({
  selector: 'app-task-comments-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './task-comments-modal.component.html',
  styleUrl: './task-comments-modal.component.css',
})
export class TaskCommentsModalComponent {
  taskCommentChaged = false;

  commentControl = new FormControl('', [Validators.required]);

  @ViewChild('commentInput') commentInputRef!: ElementRef<HTMLInputElement>;

  readonly _task: ITask = inject(DIALOG_DATA);
  readonly _dialogReg: DialogRef<boolean> = inject(DialogRef);

  onAddComent() {
    
    // Criar um comentário
    const newComment: IComment = {
      id: generateUniqueIdWithTimestamp(),
      description: this.commentControl.value ? this.commentControl.value : '',
    };

    //adicionar o novo comenário na lista de comentarios, na primeira posição da lista
    this._task.comments.unshift(newComment);

    // Resen no form control
    this.commentControl.reset();

    // Atualizar a flag/prop  se houve alteração nos comentário
    this.taskCommentChaged = true;

    // Focando no elemento
    this.commentInputRef.nativeElement.focus();
  }

  onCloseModal() {
    this._dialogReg.close(this.taskCommentChaged);
  }

  onRemoveComment(comentId: string) {
    this._task.comments = this._task.comments.filter((comment)=>comment.id !== comentId);

    this.taskCommentChaged = true;
  }
}
