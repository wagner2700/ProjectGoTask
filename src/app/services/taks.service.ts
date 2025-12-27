import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ITask } from '../interfaces/task.interface';
import { ITaskFormControls } from '../interfaces/task-form-controls.interface';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { generateUniqueIdWithTimestamp } from '../utils/generate-unique-id-with-timestamp';
import { TaskStatus } from '../types/task-status';
import { IComment } from '../interfaces/comment.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Tarefas em A fazer
  private todoTasks$ = new BehaviorSubject<ITask[]>(this.loadTasksFromLocalStorage(TaskStatusEnum.TODO));
  readonly todoTasks = this.todoTasks$
    .asObservable()
    .pipe(map((tasks) => structuredClone(tasks)),
    tap((tasks)=>this.saveTaskOnLocalStorage(TaskStatusEnum.TODO, tasks))
  );

  // Tarefas em Fazendo
  private doingTasks$ = new BehaviorSubject<ITask[]>(this.loadTasksFromLocalStorage(TaskStatusEnum.DOING));
  readonly doingTasks = this.doingTasks$
    .asObservable()
    .pipe(map((task) => structuredClone(task)),
    tap((tasks)=>this.saveTaskOnLocalStorage(TaskStatusEnum.DOING, tasks))
  );

  // Tarefas em Concluído
  private doneTasks$ = new BehaviorSubject<ITask[]>(this.loadTasksFromLocalStorage(TaskStatusEnum.DONE));
  readonly doneTasks = this.doneTasks$
    .asObservable()
    .pipe(map((task) => structuredClone(task)),
    tap((tasks)=>this.saveTaskOnLocalStorage(TaskStatusEnum.DONE, tasks))
  );

  addTask(taskInfos: ITaskFormControls) {
    const newTask: ITask = {
      ...taskInfos,
      status: TaskStatusEnum.TODO,
      id: generateUniqueIdWithTimestamp(),
      comments: [],
    };

    // Lista atual
    const currentList = this.todoTasks$.value;

    // Enviar a nova lista
    this.todoTasks$.next([...currentList, newTask]);
  }

  updateTaskStatus(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    taskNextStatus: TaskStatus,
  ) {
    const currentTaskList = this.getTaskListByStatus(taskCurrentStatus);

    const nextTaskList = this.getTaskListByStatus(taskNextStatus);
    const currentTask = currentTaskList.value.find(
      (task) => task.id === taskId,
    );

    if (currentTask) {
      // Atualizando o status da tarefa
      currentTask.status = taskNextStatus;

      // Removendo a tarefa da lista atual
      const currentTaskListWithoutTask = currentTaskList.value.filter(
        (task) => task.id !== taskId,
      );

      currentTaskList.next([...currentTaskListWithoutTask]);

      // Adicionando a tarefa na nova lista
      nextTaskList.next([...nextTaskList.value, { ...currentTask }]);
    }
  }

  updateTaskNameAndDescription(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    newTaskName: string,
    newTaskDescription: string,
  ) {
    const currentTaskList = this.getTaskListByStatus(taskCurrentStatus);

    const currentTaskIndex = currentTaskList.value.findIndex(
      (task) => task.id === taskId,
    );

    if (currentTaskIndex > -1) {
      const updatedTaskList = [...currentTaskList.value];

      updatedTaskList[currentTaskIndex] = {
        ...updatedTaskList[currentTaskIndex],
        name: newTaskName,
        description: newTaskDescription,
      };

      currentTaskList.next(updatedTaskList);
    }
  }

  updateTaskComments(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    newTaskComments: IComment[],
  ) {
    // Pegar lista que contem status da tarefa
    const currentTaskList = this.getTaskListByStatus(taskCurrentStatus);
    // Obter tarefa
    const currentTaskIndex = currentTaskList.value.findIndex(
      (task) => task.id === taskId,
    );
    if (currentTaskIndex > -1) {
      const updatedTaskList = [...currentTaskList.value];

      updatedTaskList[currentTaskIndex] = {
        // Manter as propriedades 
        ...updatedTaskList[currentTaskIndex],
        // Alterar somente os comentários
        comments: [...newTaskComments]
      };

      currentTaskList.next(updatedTaskList);
    }
  }

  private getTaskListByStatus(taskStatus: TaskStatus) {
    const taskListObj = {
      [TaskStatusEnum.TODO]: this.todoTasks$,
      [TaskStatusEnum.DOING]: this.doingTasks$,
      [TaskStatusEnum.DONE]: this.doneTasks$,
    };

    return taskListObj[taskStatus];
  }

  deleteTask(taskId: string , taskCurrentStatus: TaskStatus){
    const currentTaskList = this.getTaskListByStatus(taskCurrentStatus)
    console.log(' LISTA  ' , currentTaskList.value , taskId)
    const newTaskList = currentTaskList.value.filter(task =>  task.id !== taskId)
    console.log('NOVA LISTA  ' , newTaskList)

    currentTaskList.next(newTaskList);
  }



  private saveTaskOnLocalStorage(key: string , tasks: ITask[]){
    try{
      localStorage.setItem(key, JSON.stringify(tasks));
    }catch(error){
      console.log('Erro ao salvar tarefas no Local Storage' , error);
    }
  }

  private loadTasksFromLocalStorage(key: string){
    try {
      const storageTasks = localStorage.getItem(key);
      return storageTasks ? JSON.parse(storageTasks) : []
      
    } catch (error) {
      console.error('Erro ao carregar tarefas do local storage ' , error)
      return []
    }
  }
}
