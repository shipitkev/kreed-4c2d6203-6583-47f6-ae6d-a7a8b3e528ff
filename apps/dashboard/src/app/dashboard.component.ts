import { Component, inject, OnInit, OnDestroy, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService } from './services/tasks.service';
import { Task } from '@task-manager/data';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TopNavComponent } from './nav/top-nav.component';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionAdd, ionPencil, ionClose, ionChevronDown, ionChevronUp } from '@ng-icons/ionicons';
import { ModalStore, OrganizationsStore, AuthStore } from './store';
import { Role } from '@task-manager/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, TopNavComponent, FormsModule, NgIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [provideIcons({ ionAdd, ionPencil, ionClose, ionChevronDown, ionChevronUp })]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private tasksService = inject(TasksService);
  private modalStore = inject(ModalStore);
  protected organizationsStore = inject(OrganizationsStore);
  private authStore = inject(AuthStore);

  tasks = signal<Task[]>([]);
  selectedOrganizationIds = signal<Set<string>>(new Set()); // Will be initialized with all orgs
  selectedTags = signal<Set<string>>(new Set()); // Will be initialized with all tags
  showOrgFilterDropdown = signal(false);
  showTagFilterDropdown = signal(false);
  showSortDropdown = signal(false);
  sortBy = signal<'createdAt' | 'updatedAt'>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  private _hasInitialized = false;
  private _hasInitializedTags = false;
  
  // Special constant for "No Tags" filter option
  readonly NO_TAGS_OPTION = '__NO_TAGS__';
  
  getOrganizationName(organizationId: string): string {
    const org = this.organizationsStore.organizations().find(o => o.id === organizationId);
    return org?.name || 'Unknown';
  }

  toggleOrganizationFilter(orgId: string) {
    const current = this.selectedOrganizationIds();
    const newSet = new Set(current);
    
    if (newSet.has(orgId)) {
      newSet.delete(orgId);
    } else {
      newSet.add(orgId);
    }
    
    this.selectedOrganizationIds.set(newSet);
  }

  isOrganizationSelected(orgId: string): boolean {
    const selected = this.selectedOrganizationIds();
    return selected.has(orgId);
  }

  isAllSelected(): boolean {
    const selected = this.selectedOrganizationIds();
    const allOrgs = this.organizationsStore.organizations();
    // All are selected if the selected set size equals the total orgs count
    return allOrgs.length > 0 && selected.size === allOrgs.length;
  }

  toggleAllOrganizations() {
    const allOrgs = this.organizationsStore.organizations();
    
    if (this.isAllSelected()) {
      // Deselect all
      this.selectedOrganizationIds.set(new Set());
    } else {
      // Select all
      const allOrgIds = new Set(allOrgs.map(org => org.id));
      this.selectedOrganizationIds.set(allOrgIds);
    }
  }

  getFilterButtonText(): string {
    const selected = this.selectedOrganizationIds();
    const allOrgs = this.organizationsStore.organizations();
    
    // If nothing is selected, show "No Organizations"
    if (selected.size === 0) {
      return 'No Organizations';
    }
    
    // If all are selected, show "All Organizations"
    if (allOrgs.length > 0 && selected.size === allOrgs.length) {
      return 'All Organizations';
    }
    
    if (selected.size === 1) {
      const orgId = Array.from(selected)[0];
      return this.truncateText(this.getOrganizationName(orgId), 25);
    }
    return `${selected.size} Organizations`;
  }

  toggleDropdown() {
    this.showOrgFilterDropdown.update(v => !v);
  }

  closeDropdown() {
    this.showOrgFilterDropdown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.org-filter-container')) {
      this.closeDropdown();
    }
    if (!target.closest('.tag-filter-container')) {
      this.closeTagDropdown();
    }
    if (!target.closest('.sort-container')) {
      this.closeSortDropdown();
    }
  }

  filteredTasks = computed(() => {
    const allTasks = this.tasks();
    const selectedOrgs = this.selectedOrganizationIds();
    const selectedTags = this.selectedTags();
    const allOrgs = this.organizationsStore.organizations();
    
    // First filter by organizations
    let filtered = allTasks;
    
    // If nothing is selected, show no tasks
    if (selectedOrgs.size === 0) {
      return [];
    }
    
    // If not all orgs are selected, filter by selected organizations
    if (allOrgs.length > 0 && selectedOrgs.size !== allOrgs.length) {
      filtered = filtered.filter(t => selectedOrgs.has(t.organizationId));
    }
    
    // Then filter by tags
    if (selectedTags.size > 0) {
      const allAvailableTags = this.getAllAvailableTagsWithNoTags();
      const hasNoTagsOption = selectedTags.has(this.NO_TAGS_OPTION);
      const hasRegularTags = Array.from(selectedTags).some(tag => tag !== this.NO_TAGS_OPTION);
      
      // If all options (including "No Tags") are selected, show all tasks (no tag filter)
      if (selectedTags.size !== allAvailableTags.length) {
        filtered = filtered.filter(t => {
          const hasNoTags = !t.tags || t.tags.length === 0;
          
          // If "No Tags" is selected and task has no tags, include it
          if (hasNoTagsOption && hasNoTags) {
            return true;
          }
          
          // If regular tags are selected and task has matching tags, include it
          if (hasRegularTags && !hasNoTags && t.tags) {
            return t.tags.some(tag => selectedTags.has(tag));
          }
          
          return false;
        });
      }
    } else {
      // If no tags selected, show no tasks
      filtered = [];
    }
    
    // Sort tasks - explicitly read sort signals to ensure reactivity
    const sortField = this.sortBy();
    const order = this.sortOrder();
    
    const sorted = [...filtered].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      if (sortField === 'createdAt') {
        // Handle both Date objects and string dates from API
        const aDate = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)) : null;
        const bDate = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)) : null;
        aValue = aDate && !isNaN(aDate.getTime()) ? aDate.getTime() : 0;
        bValue = bDate && !isNaN(bDate.getTime()) ? bDate.getTime() : 0;
      } else {
        // Handle both Date objects and string dates from API
        const aDate = a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt)) : null;
        const bDate = b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt)) : null;
        aValue = aDate && !isNaN(aDate.getTime()) ? aDate.getTime() : 0;
        bValue = bDate && !isNaN(bDate.getTime()) ? bDate.getTime() : 0;
      }
      
      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return sorted;
  });
  
  openTasks = computed(() => this.filteredTasks().filter(t => t.status === 'OPEN'));
  inProgressTasks = computed(() => this.filteredTasks().filter(t => t.status === 'IN_PROGRESS'));
  doneTasks = computed(() => this.filteredTasks().filter(t => t.status === 'DONE'));

  columns = [
    { id: 'OPEN', title: 'To Do', tasks: this.openTasks, isDone: false },
    { id: 'IN_PROGRESS', title: 'In Progress', tasks: this.inProgressTasks, isDone: false },
    { id: 'DONE', title: 'Done', tasks: this.doneTasks, isDone: true }
  ];


  private taskDeletedHandler = ((event: CustomEvent) => {
    const taskId = event.detail?.taskId;
    if (taskId) {
      this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    }
  }) as EventListener;

  private taskUpdatedHandler = ((event: CustomEvent) => {
    const taskId = event.detail?.taskId;
    if (taskId) {
      // Reload tasks to get updated data
      this.loadTasks();
    }
  }) as EventListener;

  private accountSwitchedHandler = ((event: CustomEvent) => {
    // Immediately clear tasks for security
    this.tasks.set([]);
    // Reset organization filter for the new user
    this.selectedOrganizationIds.set(new Set());
    this.selectedTags.set(new Set());
    this._hasInitialized = false;
    this._hasInitializedTags = false;
    // Then reload tasks for the new user
    this.loadTasks();
  }) as EventListener;

  constructor() {
    // Listen for task deletion events from the modal
    window.addEventListener('task-deleted', this.taskDeletedHandler);
    // Listen for task update events
    window.addEventListener('task-updated', this.taskUpdatedHandler);
    // Listen for task creation events
    window.addEventListener('task-created', this.taskCreatedHandler);
    // Listen for account switch events
    window.addEventListener('account-switched', this.accountSwitchedHandler);

    // Watch for organizations to load and initialize selection
    effect(() => {
      // Don't run if organizations are still loading
      if (this.organizationsStore.isLoading()) {
        return;
      }
      
      const orgs = this.organizationsStore.organizations();
      
      // Only run initialization logic if we haven't initialized yet
      if (!this._hasInitialized && orgs.length > 0) {
        // Auto-select all organizations on first load
        const allOrgIds = new Set(orgs.map(org => org.id));
        this.selectedOrganizationIds.set(allOrgIds);
        this._hasInitialized = true;
      } else if (this._hasInitialized && orgs.length > 0) {
        // After initialization, check if selected orgs are invalid (user switched)
        const selected = this.selectedOrganizationIds();
        const orgIds = new Set(orgs.map(org => org.id));
        const hasInvalidSelections = Array.from(selected).some(id => !orgIds.has(id));
        
        // If we have invalid selections, reset and select all
        if (hasInvalidSelections) {
          const allOrgIds = new Set(orgs.map(org => org.id));
          this.selectedOrganizationIds.set(allOrgIds);
        }
      } else if (orgs.length === 0 && this._hasInitialized) {
        // If no orgs and we were initialized, clear selection and reset flag
        this.selectedOrganizationIds.set(new Set());
        this._hasInitialized = false;
      }
    });

    // Watch for tasks to load and initialize tag selection
    effect(() => {
      const allTasks = this.tasks();
      if (allTasks.length > 0 && !this._hasInitializedTags) {
        const allTags = this.getAllAvailableTagsWithNoTags();
        if (allTags.length > 0) {
          // Auto-select all tags (including "No Tags") on first load
          const allTagSet = new Set(allTags);
          this.selectedTags.set(allTagSet);
          this._hasInitializedTags = true;
        }
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('task-deleted', this.taskDeletedHandler);
    window.removeEventListener('task-updated', this.taskUpdatedHandler);
    window.removeEventListener('task-created', this.taskCreatedHandler);
    window.removeEventListener('account-switched', this.accountSwitchedHandler);
  }
  

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe(tasks => {
      // Parse date strings to Date objects if needed
      const parsedTasks = tasks.map(task => {
        let createdAt: Date;
        let updatedAt: Date;
        
        if (task.createdAt) {
          const date = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
          createdAt = !isNaN(date.getTime()) ? date : new Date();
        } else {
          createdAt = new Date();
        }
        
        if (task.updatedAt) {
          const date = task.updatedAt instanceof Date ? task.updatedAt : new Date(task.updatedAt);
          updatedAt = !isNaN(date.getTime()) ? date : new Date();
        } else {
          updatedAt = new Date();
        }
        
        return {
          ...task,
          createdAt,
          updatedAt,
        };
      });
      this.tasks.set(parsedTasks);
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    const task = event.previousContainer.data[event.previousIndex];
    
    // Prevent drag-and-drop if user can't edit this specific task
    if (!this.canEditTask(task)) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const newStatus = event.container.id; // 'OPEN', 'IN_PROGRESS', 'DONE'
      
      // Optimistic update
      const updatedTask = { ...task, status: newStatus as any };
      
      // Update local state is tricky with computed signals derived from single source.
      // Easiest is to update the single source.
      const currentTasks = this.tasks();
      const taskIndex = currentTasks.findIndex(t => t.id === task.id);
      if (taskIndex > -1) {
          const newTasks = [...currentTasks];
          newTasks[taskIndex] = updatedTask;
          this.tasks.set(newTasks);
      }

      this.tasksService.updateTask(task.id, { status: newStatus as any }).subscribe({
        error: () => this.loadTasks() // Revert on error
      });
    }
  }

  private taskCreatedHandler = ((event: CustomEvent) => {
    // Reload tasks when a new task is created
    this.loadTasks();
  }) as EventListener;

  deleteTask(id: string) {
    this.modalStore.setModal(`delete-task&id=${id}`);
  }

  editTask(id: string) {
    this.modalStore.setModal(`view-task&id=${id}`);
  }

  openCreateModal() {
    this.modalStore.setModal('create-task');
  }
  
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getAllAvailableTags(): string[] {
    // Return predefined tags (Work and Personal) so they always appear in the filter
    return ['Work', 'Personal'];
  }

  getAllAvailableTagsWithNoTags(): string[] {
    // Return all tag options including the "No Tags" option
    return [...this.getAllAvailableTags(), this.NO_TAGS_OPTION];
  }

  toggleTagFilter(tag: string) {
    const current = this.selectedTags();
    const newSet = new Set(current);
    
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    
    this.selectedTags.set(newSet);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().has(tag);
  }

  isAllTagsSelected(): boolean {
    const selected = this.selectedTags();
    const allTags = this.getAllAvailableTagsWithNoTags();
    return allTags.length > 0 && selected.size === allTags.length;
  }

  toggleAllTags() {
    const allTags = this.getAllAvailableTagsWithNoTags();
    
    if (this.isAllTagsSelected()) {
      // Deselect all
      this.selectedTags.set(new Set());
    } else {
      // Select all (including "No Tags")
      const allTagSet = new Set(allTags);
      this.selectedTags.set(allTagSet);
    }
  }

  getTagFilterButtonText(): string {
    const selected = this.selectedTags();
    const allTags = this.getAllAvailableTagsWithNoTags();
    
    if (selected.size === 0) {
      return 'No Tags';
    }
    if (allTags.length > 0 && selected.size === allTags.length) {
      return 'All Tags';
    }
    if (selected.size === 1) {
      const tag = Array.from(selected)[0];
      return tag === this.NO_TAGS_OPTION ? 'No Tags' : tag;
    }
    return `${selected.size} Tags`;
  }

  toggleTagDropdown() {
    this.showTagFilterDropdown.update(v => !v);
  }

  closeTagDropdown() {
    this.showTagFilterDropdown.set(false);
  }

  toggleSortOrder() {
    this.sortOrder.update(order => order === 'asc' ? 'desc' : 'asc');
  }

  toggleSortDropdown() {
    this.showSortDropdown.update(v => !v);
  }

  closeSortDropdown() {
    this.showSortDropdown.set(false);
  }

  setSortBy(field: 'createdAt' | 'updatedAt') {
    this.sortBy.set(field);
    this.closeSortDropdown();
  }

  getSortButtonText(): string {
    const field = this.sortBy();
    return field === 'createdAt' ? 'Created At' : 'Last Updated';
  }

  canEditTasks(): boolean {
    const user = this.authStore.user();
    if (!user) return false;
    const role = this.organizationsStore.getCurrentUserRole(user.id);
    return role === Role.OWNER || role === Role.ADMIN;
  }

  canEditTask(task: Task): boolean {
    const user = this.authStore.user();
    if (!user) return false;
    // Get user's role in the task's organization
    const role = this.organizationsStore.getUserRoleInOrganization(user.id, task.organizationId);
    return role === Role.OWNER || role === Role.ADMIN;
  }
}
