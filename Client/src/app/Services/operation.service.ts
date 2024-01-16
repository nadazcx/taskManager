import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  private apiUrl = 'http://localhost:8080/Assign'; 


  constructor(private http: HttpClient,private commonService : CommonService) { }

  getProjectByUserId(req:any) : Observable<any>{
    const token = this.commonService.getToken();
    console.log("hi");
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    

    return this.http.post(`${this.apiUrl}/getProjectsByUserId`, { userId: req }, {headers} );
  }

  fetchUserList() {
    const token = this.commonService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    console.log(`${this.apiUrl}/fetchAllUserList`, { headers })
  
    return this.http.get(`${this.apiUrl}/fetchAllUserList`, { headers }).pipe(
      catchError((error) => {
        // Handle the error here, you can log it or show a user-friendly message
        console.error('Error fetching user list:', error);
        
        // Rethrow the error to propagate it to the subscriber
        return throwError(error);
      })
    );
  }

  getTaskByProjectId(req:any) : Observable<any>{
    const token = this.commonService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/getTaskbyProjectId`,{projectId : req}, {headers});
    console.log(`${this.apiUrl}/getTaskbyProjectId`,{projectId : req}, {headers})
  }

  deleteTaskById(req:any) : Observable<any>{

    const token = this.commonService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const taskId = req;

    return this.http.get(`${this.apiUrl}/deleteTaskById/${taskId}`, {headers});

  }

  createProject(data:any) : Observable<any>{
    const token = this.commonService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const projectData = {
      projectName: data.projectName,
      userIds: data.selectedUserIdsString,
    }

    return this.http.post(`${this.apiUrl}/createProject`, projectData , {headers});
  }

  getProjectDetailsByPid(pid:number) : Observable<any>
  {
    const token = this.commonService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.apiUrl}/getProjectDetailsByPid/${pid}`, {headers});
  }

  /**
 * Creates a new task using the given task data.
 * 
 * @param {Object} taskData - The task data to use for creating the task.
 * @param {string} taskData.description - The description of the task.
 * @param {number} taskData.projectId - The ID of the project to which the task belongs.
 * @returns {Observable<any>} An Observable that emits the created task on success, or an error on failure.
 */
  createTask(taskData: any): Observable<any> {

    const token = this.commonService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/createTasks`, taskData, {headers});
  }

  editTask(taskData : any) : Observable<any> {
    const token = this.commonService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(`${this.apiUrl}/editTask`, taskData, {headers});
  }


}
