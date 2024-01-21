import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { OperationService } from 'src/app/Services/operation.service';
import { ChangeDetectorRef } from '@angular/core';
import ACTIONS from '../../Actions/Actions';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/Services/common.service';

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

  constructor(
    private toastr: ToastrService,
    private operationService: OperationService,
    private cdr: ChangeDetectorRef,
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

      // taskForm builder
      this.taskForm = this.fb.group({
        taskDescription: ['', Validators.required],
      });

      // if userList is not fetched yet, then we are fetching userList once
      if (this.userList.length === 0) {
        this.fetchUserList();
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

            this.fetchTasks(this.projectId);

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

          this.projectForm.reset();

          this.fetchProjectDetails();
          this.closeCreateProjectPopup();
        },
        (error) => {
          console.error('Error creating project:', error);
          this.toastr.error('Error creating project:', 'error');
        }
      );
  }

  editProjectOpen(project: any) {
    this.editProjectNow = true;
  }

  fetchProjectDetails() {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const user = JSON.parse(userDetails);
      const userId = user.user.userId;

      this.operationService.getProjectByUserId(userId).subscribe(
        (response) => {
          console.log('get projects done');
          this.projects = response.projects;
          console.log(response.projects)
          this.projects.forEach((project: any) => {
          });

          this.toastr.success('Projects fetched successfully !!', 'Success');
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
    this.isEditingTask = false;
    this.editingTask = null;

    this.operationService.editTask(task).subscribe(
      (response) => {
        this.toastr.success('Task updated successfully!!', 'Success');
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
    this.operationService.deleteTaskById(task.taskId).subscribe(
      (response) => {
        this.toastr.success('Task deleted successfully!!', 'Success');
        this.fetchTasks(this.projectId);
      },
      (error) => {
        this.toastr.error('Tasks deleting failed !!!', error);
      }
    );
  }
}
