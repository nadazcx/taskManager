import { Component, OnDestroy, OnInit } from '@angular/core';
import { response } from 'express';
import { ToastNoAnimation, ToastrService } from 'ngx-toastr';
import { OperationService } from 'src/app/Services/operation.service';
import { ChangeDetectorRef } from '@angular/core';
import ACTIONS from '../../Actions/Actions';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/Services/common.service';
import { SocketService } from 'src/app/Services/socket.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
  projectForm!: FormGroup;
  taskForm!: FormGroup;

  projects: any[] = [];
  tasks: any[] = [];
  projectId: String = '';
  openTaskPopup: boolean = false;
  isOpenCreateProject: boolean = false;
  userList: any[] = [];
  selectedUserIds: string = '';
  selectedUserNames: string[] = [];
  selectedUsers: any[] = [];
  isTaskCreating: boolean = false;
  newTaskDescription: string = '';
  isEditingTask: boolean = false;
  editingTask: any;
  editProjectNow: boolean = false;

  private socket?: any;
  constructor(
    private toastr: ToastrService,
    private operationService: OperationService,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService,
    private router: Router,
    private fb: FormBuilder,
    private commonService: CommonService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.fetchProjectDetails();

      this.projectForm = this.fb.group({
        projectName: ['', Validators.required],
        selectedUsers: [[]], // Initialize as an empty array
      });

      //taskForm builder
      this.taskForm = this.fb.group({
        taskDescription: ['', Validators.required],
      });

      //if userList is not fetched yet, then we are fetch userList once
      if (this.userList.length === 0) {
        this.fetchUserList();
      }

      const userDetails = localStorage.getItem('userDetails');
      if (userDetails) {
        const user = JSON.parse(userDetails);

        if (!this.socket) {
          // this.socket = await initSocket();
          this.socket = this.socketService.getSocket();
          // this.socket = await this.socketService.initSocket();
          console.log('socket value after init, ', this.socket);
          console.log('socket value in task, ', this.socket);

          const data = {
            userId: user.user.userId,
            username: user.user.username,
            socketId: this.socket.id,
          };

          // this.socket.emit(ACTIONS.LOGIN, data);
        }


        this.socketService.getSocket().subscribe((socket: any) => {
          if (socket) {
            this.socket = socket;
            console.log('socket id is ' + socket.id);

            this.socket.on(ACTIONS.TASK_CREATED, (data: any) => {
              this.toastr.success(
                `${data.adminName} has create task ${data.taskName} in ${data.projectName} `,
                'Success'
              );
              this.openTaskPopup = false;
              this.fetchProjectDetails();
              this.fetchTasks(data.projectId);
            });
            
          }
        });

        // this.socket.on(
        //   ACTIONS.JOINED,
        //   (loginUsers: any, username: any, socketId: any) => {
        //     this.toastr.success(`${username} is now online`);
        //   }
        // );

        this.socket.on(ACTIONS.TASK_DELETED, (data: any) => {
          this.toastr.success(
            `Task ${data.taskId} is deleted by ${data.adminName}`,
            'Success'
          );

          this.fetchTasks(data.projectId);
        });

        this.socket.on(ACTIONS.PROJECT_CREATED, (data: any) => {
          this.toastr.success(
            `${data.adminName} has added you in project ${data.projectName}`,
            'Success'
          );
          this.fetchProjectDetails();
        });


        // this.socket.on(ACTIONS.TASK_CREATED, (data: any) => {
        //   this.toastr.success(
        //     `${data.adminName} has create task ${data.taskName} in ${data.projectName} `,
        //     'Success'
        //   );
        //   this.openTaskPopup = false;
        //   this.fetchProjectDetails();
        //   this.fetchTasks(data.projectId);
        // });

        this.socket.on(ACTIONS.TASK_UPDATED, (data: any) => {
          this.toastr.success(
            `${data.adminName} has update task ${data.taskName} in ${data.projectName} `,
            'Success'
          );
          this.openTaskPopup = false;
          this.fetchProjectDetails();
          this.fetchTasks(data.projectId);
        });
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  submitCreateTask() {
    if (this.taskForm.valid) {
      const taskData = {
        projectId: this.projectId,
        taskName: this.taskForm.get('taskDescription')?.value,
      };

      this.operationService.createTask(taskData).subscribe(
        (response) => {
          if (response.status === 200) {
            console.log('response : ', response.task.insertId);
            this.toastr.success('Task created successfully!!', 'Success');

            const username = this.commonService.getUserDetails().username;

            this.fetchTasks(this.projectId);

            // if (!this.socket) return;

            this.socketService.getSocket().subscribe((socket: any) => {
              if (socket) {
                this.socket = socket;
                console.log('socket id is ' + socket.id);

                const data = {
                  taskId: response.task.insertId,
                  adminName: username,
                };

                this.socket.emit(ACTIONS.TASK_CREATE, data);
              }
            });

            // this.socket =  this.socketService.getSocket();

            // this.socket.emit(ACTIONS.TASK_CREATE, {
            //   taskId: response.task.insertId,
            //   adminName: username,
            // });

            this.newTaskDescription = '';
            this.taskForm.reset();
            this.closeCreateTask();
          } else {
            this.toastr.error(
              'Error while creating task from backend!!',
              'Error'
            );
          }
        },
        (error) => {
          console.log('error : ', error);
          this.toastr.error('Task creation failed!!', 'Error');
        }
      );
    }
  }

  showCreateTask() {
    this.isTaskCreating = true;
  }

  closeCreateTask() {
    this.isTaskCreating = false;
  }

  redirectToProject(projectId: number): void {
    this.router.navigate(['/project', projectId]);
  }

  openCreateProjectPopup() {
    this.isOpenCreateProject = true;
  }

  closeCreateProjectPopup() {
    this.isOpenCreateProject = false;
  }

  fetchUserList() {
    this.operationService.fetchUserList().subscribe(
      (res: any) => {
        const userDetails = localStorage.getItem('userDetails');
        if (userDetails) {
          const user = JSON.parse(userDetails);
          const loginUserId = user.user.userId;

          const matchingUserIndex = res.userList.findIndex(
            (user: any) => user.userId === loginUserId
          );

          if (matchingUserIndex !== -1) {
            // Remove the matching user from the array
            res.userList.splice(matchingUserIndex, 1);
          }
        } else {
          this.userList = res.userList; // If userDetails is not available, use the original userList
        }

        this.userList = res.userList;
        console.log('User list fetch completed:', this.userList);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching user list:', error);
        this.toastr.error('Error while fetching user list:', error);
      }
    );
  }

  createUserIdsString(user: any) {
    if (this.selectedUserIds.length === 0) {
      this.selectedUserIds = user.userId;
    } else this.selectedUserIds = this.selectedUserIds + ',' + user.userId;

    this.selectedUserNames.push(user.username);
  }

  submitProjectForm() {
    // Get the comma-separated user IDs

    const projectName = this.projectForm.get('projectName')?.value;
    const selectedUsers = this.projectForm.get('selectedUsers')?.value;

    const userDetails = localStorage.getItem('userDetails');

    let selectedUserIdsString: string = '';
    if (userDetails) {
      const user = JSON.parse(userDetails);
      const loginUserId = user.user.userId;

      selectedUserIdsString = loginUserId;

      const selectedUserIds = this.selectedUsers.map((user) => user.userId);

      // Join selectedUserIds with loginUserId, separated by a comma
      selectedUserIdsString += ',' + selectedUserIds.join(',');
    }

    // const selectedUserIsString = this.selectedUsers
    //   .map((user) => user.userId)
    //   .join(',');

    console.log(
      'selectedUserIdsString : ',
      projectName,
      selectedUsers,
      selectedUserIdsString
  

    );

    this.operationService
      .createProject({ projectName, selectedUserIdsString })
      .subscribe(
        (response) => {
          console.log('project print : ', response.project);
          this.toastr.success('Project created successfully', 'success');

          const userDetails = localStorage.getItem('userDetails');
          if (userDetails) {
            const user = JSON.parse(userDetails);
            const username = user.user.username;

            if (!this.socket) return;
            this.socket.emit(ACTIONS.PROJECT_CREATE, {
              projectId: response.project.insertId,
              adminName: username,
            });
          }

          this.projectForm.reset();

          this.fetchProjectDetails();
          this.closeCreateProjectPopup();
        },
        (error) => {
          console.error('Error creating project:', error);
          this.toastr.error('Error creating project:', 'error');
        }
      );

    // Now you can use selectedUserIdsString in your form submission logic
    console.log('Selected User IDs:', this.selectedUserIds);
  }

  editProjectOpen(project: any) {
    this.editProjectNow = true;
  }

  fetchProjectDetails() {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const user = JSON.parse(userDetails);
      const userId = user.user.userId;
      const userNamename=user.user.username

      this.operationService.getProjectByUserId(userId).subscribe(
        (response) => {
          console.log('get projects done');
          this.projects = response.projects;
          this.toastr.success('Projects fetched successfullly !!', 'Success');
        },
        (error) => {
          this.toastr.error('Project fetching failed !!!', error);
        }
      );
    }
  }

  fetchTasks(projectId: any) {
    this.projectId = projectId;
    this.operationService.getTaskByProjectId(projectId).subscribe(
      (response) => {
        console.log('get projects done');
        this.tasks = response.tasks;
        this.openTaskPopup = true;
        this.cdr.detectChanges();
        this.toastr.success('Tasks fetched successfullly !!', 'Success');
      },
      (error) => {
        this.toastr.error('Tasks fetching failed !!!', error);
      }
    );
  }

  closePopup() {
    this.openTaskPopup = false;
  }

  editTask(task: any) {
    this.isEditingTask = true;
    this.editingTask = task;
    console.log(this.isEditingTask);
  }

  saveTask(task: any) {
    // Perform any necessary save logic here
    this.isEditingTask = false;
    this.editingTask = null;

    this.operationService.editTask(task).subscribe(
      (response) => {
        this.toastr.success('Task updated successfully!!', 'Success');

        if (!this.socket) return;
        this.socket.emit(ACTIONS.TASK_UPDATE, {
          taskId: task.taskId,
          adminName: this.commonService.getUserDetails().username,
        });

        this.fetchTasks(this.projectId);
      },
      (error) => {
        this.toastr.error('Task update failed!!', 'Error');
      }
    );
  }

  cancelEditing() {
    this.isEditingTask = false;
    this.editingTask = null;
  }

  deleteTask(task: any) {
    console.log(task.taskId);
    console.log('this socketId : ', this.socket);

    this.operationService.deleteTaskById(task.taskId).subscribe(
      (response) => {
        if (!this.socket) return;
        this.socket.emit(ACTIONS.TASK_DELETE, {
          taskId: task.taskId,
          projectId: response.projectId,
          adminName: this.commonService.getUserDetails().username,
        });

        this.toastr.success('socketId : ', this.socket.id);

        this.fetchTasks(this.projectId);
      },
      (error) => {
        this.toastr.error('Tasks deleting failed !!!', error);
      }
    );
  }
}
