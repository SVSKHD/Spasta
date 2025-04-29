<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useNoteStore } from '../store/noteStore';
import { useCategoryStore, type Category } from '../store/categoryStore';
import { useToastStore } from '../store/toastStore';
import SpastaCategoryList from '../components/spastaCategoryList.vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Highlighter, Underline as UnderlineIcon, Search, Save, Trash2 } from 'lucide-vue-next';
import { format } from 'date-fns';
import { Editor } from '@tiptap/vue-3';

const noteStore = useNoteStore();
const categoryStore = useCategoryStore();
const toastStore = useToastStore();
const isLoading = ref(true);
const selectedCategoryId = ref<string>('');
const selectedNoteId = ref<string | null>(null);
const searchQuery = ref('');
const isSaving = ref(false);
const autoSaveTimeout = ref<number | null>(null);

const newNote = ref({
  title: '',
  content: '',
  categoryId: '',
  tags: [] as string[],
  remarks: '',
  keywords: [] as string[]
});

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Start writing your note...'
    }),
    TaskList,
    TaskItem,
    Link,
    Highlight,
    Underline
  ],
  content: '',
  onUpdate: ({ editor }) => {
    newNote.value.content = editor.getHTML();
    triggerAutoSave();
  }
});

const categories = computed<Category[]>(() => categoryStore.categories.sort((a, b) => a.name.localeCompare(b.name)));

const notes = computed(() => {
  if (!selectedCategoryId.value) return [];
  return noteStore.notesByCategory(selectedCategoryId.value)
    .filter(note => {
      if (!searchQuery.value) return true;
      const query = searchQuery.value.toLowerCase();
      return note.title.toLowerCase().includes(query) || 
             note.content.toLowerCase().includes(query) ||
             note.tags?.some(tag => tag.toLowerCase().includes(query)) ||
             note.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
             note.remarks?.toLowerCase().includes(query);
    });
});

// const selectedNote = computed(() => {
//   return notes.value.find(note => note.id === selectedNoteId.value);
// });

function promptForLink(editor: Editor | null) {
  if (!editor) return;
  const url = window.prompt('Enter URL');
  if (url) {
    editor.chain().focus().setLink({ href: url }).run();
  }
}

// Watch for category changes to fetch notes
watch(() => selectedCategoryId.value, async (newCategoryId) => {
  if (newCategoryId) {
    try {
      isLoading.value = true;
      await noteStore.fetchNotesByCategory(newCategoryId);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toastStore.showToast('Failed to load notes', 'error');
    } finally {
      isLoading.value = false;
    }
  }
});

const triggerAutoSave = () => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  
  autoSaveTimeout.value = window.setTimeout(async () => {
    if (!newNote.value.title || !newNote.value.content) return;
    
    isSaving.value = true;
    try {
      if (selectedNoteId.value) {
        await noteStore.updateNote(selectedNoteId.value, newNote.value);
        toastStore.showToast('Note auto-saved ✨', 'success');
      } else if (selectedCategoryId.value) {
        const note = await noteStore.addNote({
          ...newNote.value,
          categoryId: selectedCategoryId.value
        });
        selectedNoteId.value = note.id;
        toastStore.showToast('New note created and saved ✨', 'success');
      }
    } catch (error) {
      console.error('Error auto-saving note:', error);
      toastStore.showToast('Failed to auto-save note', 'error');
    } finally {
      isSaving.value = false;
    }
  }, 1000);
};

// Watch for changes that should trigger auto-save
watch(() => newNote.value.title, triggerAutoSave);
watch([() => newNote.value.remarks, () => newNote.value.tags, () => newNote.value.keywords], triggerAutoSave, { deep: true });

const handleSelectCategory = async (categoryId: string) => {
  selectedCategoryId.value = categoryId;
  selectedNoteId.value = null;
  resetEditor();
};

const handleSelectNote = (noteId: string) => {
  selectedNoteId.value = noteId;
  const note = notes.value.find(n => n.id === noteId);
  if (note) {
    newNote.value = {
      title: note.title,
      content: note.content,
      categoryId: note.categoryId,
      tags: note.tags || [],
      remarks: note.remarks || '',
      keywords: note.keywords || []
    };
    editor.value?.commands.setContent(note.content);
  }
};

const handleNewNote = () => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  selectedNoteId.value = null;
  resetEditor();
  toastStore.showToast('Started new note 📝', 'info');
};

const resetEditor = () => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  newNote.value = {
    title: '',
    content: '',
    categoryId: selectedCategoryId.value,
    tags: [],
    remarks: '',
    keywords: []
  };
  editor.value?.commands.setContent('');
};

const handleSave = async () => {
  if (!newNote.value.title || !newNote.value.content) {
    toastStore.showToast('Please add a title and content', 'warning');
    return;
  }
  
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  
  isSaving.value = true;
  try {
    if (selectedNoteId.value) {
      await noteStore.updateNote(selectedNoteId.value, newNote.value);
      toastStore.showToast('Note updated successfully! ✨', 'success');
    } else {
      const note = await noteStore.addNote({
        ...newNote.value,
        categoryId: selectedCategoryId.value
      });
      selectedNoteId.value = note.id;
      toastStore.showToast('Note created successfully! 📝', 'success');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    toastStore.showToast('Failed to save note', 'error');
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedNoteId.value) return;
  
  if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
    return;
  }
  
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  
  try {
    await noteStore.deleteNote(selectedNoteId.value);
    selectedNoteId.value = null;
    resetEditor();
    toastStore.showToast('Note deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting note:', error);
    toastStore.showToast('Failed to delete note', 'error');
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      categoryStore.fetchCategories(),
    ]);

    if (categories.value.length > 0) {
      selectedCategoryId.value = categories.value[0].id;
      await noteStore.fetchNotesByCategory(selectedCategoryId.value);
    }
  } catch (error) {
    console.error('Error initializing notes:', error);
    toastStore.showToast('Failed to load notes', 'error');
  } finally {
    isLoading.value = false;
  }
});


onUnmounted(() => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="text-2xl font-bold text-text mb-6">Notes</h1>
    
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <div v-else class="page-content flex flex-col">
      <!-- Categories at the top -->
      <div class="mb-6">
        <SpastaCategoryList
            :categories="categories"
            :selected-category-id="selectedCategoryId"
            @selectCategory="handleSelectCategory"
            class="w-full"
          />
      </div>

      <!-- Search and Actions Bar -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex-1 max-w-md relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
          <input
            v-model="searchQuery"
            type="text"
            class="input pl-9"
            placeholder="Search notes..."
          />
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="text-sm text-text/60">
            {{ notes.length }} notes
          </div>
          <button 
            @click="handleNewNote"
            class="btn btn-primary"
          >
            + New Note
          </button>
        </div>
      </div>

       <!-- Main Content Area -->
       <div class="flex flex-1 gap-6 min-h-[600px]">
        <!-- Notes List -->
        <div class="w-80 flex-none overflow-hidden">
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="note in notes"
              :key="note.id"
              class="group bg-card rounded-lg border border-border p-4 cursor-pointer transition-all duration-150 hover:shadow-md relative"
              :class="note.id === selectedNoteId ? 'ring-2 ring-primary-500' : ''"
              @click="handleSelectNote(note.id)"
            >
              <div class="flex flex-col mb-2">
                <h3 class="font-medium text-text">{{ note.title }}</h3>
                <div class="text-xs text-text/60 mt-1">
                  {{ format(note.updatedAt, 'MMM d, yyyy') }}
                </div>
              </div>
              
              <div class="text-sm text-text/60 line-clamp-3 mb-3" v-html="note.content"></div>
              
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in note.tags" 
                  :key="tag"
                  class="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div 
              v-if="notes.length === 0" 
              class="bg-card rounded-lg border border-border p-6 text-center"
            >
              <p class="text-text/60">
                {{ searchQuery ? 'No notes found' : 'No notes yet' }}
              </p>
              <button 
                v-if="!searchQuery"
                @click="handleNewNote"
                class="btn btn-primary mt-4"
              >
                Create your first note
              </button>
            </div>
          </div>
        </div>
        
        <!-- Editor Area -->
        <div class="flex-1 bg-card rounded-lg border border-border overflow-hidden">
          <div class="flex flex-col h-full">
            <!-- Editor Toolbar -->
            <div class="flex items-center justify-between p-4 border-b border-border bg-bg">
              <div class="flex items-center space-x-2">
                <button
  v-for="(action, index) in [
    { icon: Bold, command: () => editor?.chain().focus().toggleBold().run(), active: 'bold' },
    { icon: Italic, command: () => editor?.chain().focus().toggleItalic().run(), active: 'italic' },
    { icon: UnderlineIcon, command: () => editor?.chain().focus().toggleUnderline().run(), active: 'underline' },
    { icon: Highlighter, command: () => editor?.chain().focus().toggleHighlight().run(), active: 'highlight' },
    { icon: List, command: () => editor?.chain().focus().toggleBulletList().run(), active: 'bulletList' },
    { icon: ListOrdered, command: () => editor?.chain().focus().toggleOrderedList().run(), active: 'orderedList' },
    { icon: LinkIcon, command: () => promptForLink(editor ?? null), active: 'link' }
  ]"
  :key="index"
  @click="action.command"
>
  <component :is="action.icon" class="w-5 h-5" />
</button>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  v-if="selectedNoteId"
                  @click="handleDelete"
                  class="btn btn-error"
                  :disabled="isSaving"
                >
                  <Trash2 class="w-4 h-4 mr-1" />
                  Delete
                </button>
                <button
                  @click="handleSave"
                  class="btn btn-primary"
                  :disabled="isSaving || !newNote.title || !newNote.content"
                >
                  <Save class="w-4 h-4 mr-1" />
                  {{ isSaving ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
            
            <!-- Editor Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <input
                v-model="newNote.title"
                type="text"
                class="w-full text-3xl font-bold mb-6 bg-transparent border-none outline-none placeholder-text/30"
                placeholder="Note title..."
              />
              
              <editor-content :editor="editor" class="prose prose-lg max-w-none mb-6" />
              
              <div class="space-y-4">
                <input 
                  v-model="newNote.remarks" 
                  type="text" 
                  class="w-full text-lg bg-transparent border-none outline-none placeholder-text/30"
                  placeholder="Add remarks..."
                />
                
                <input 
                  :value="newNote.tags.join(', ')"
                  type="text" 
                  class="w-full text-sm bg-transparent border-none outline-none placeholder-text/30"
                  placeholder="Add tags (comma separated)..."
                  @input="(e) => newNote.tags = (e.target as HTMLInputElement).value.split(',').map(t => t.trim())"
                />
                
                <input 
                  :value="newNote.keywords.join(', ')"
                  type="text" 
                  class="w-full text-sm bg-transparent border-none outline-none placeholder-text/30"
                  placeholder="Add keywords (comma separated)..."
                  @input="(e) => newNote.keywords = (e.target as HTMLInputElement).value.split(',').map(k => k.trim())"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
 
    </div>
  </div>
</template>

<style>
/* Editor Styles */
.ProseMirror {
  @apply text-text outline-none min-h-[200px];
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  @apply text-text/30 float-left h-0 pointer-events-none;
}

.ProseMirror ul[data-type="taskList"] {
  @apply list-none p-0;
}

.ProseMirror ul[data-type="taskList"] li {
  @apply flex items-start;
}

.ProseMirror ul[data-type="taskList"] li > label {
  @apply mr-2 -mt-1;
}

.ProseMirror ul[data-type="taskList"] li > div {
  @apply flex-1;
}

.ProseMirror mark {
  @apply bg-warning-100 dark:bg-warning-900;
}

/* Prose Styles */
.prose {
  @apply text-text;
}

.prose a {
  @apply text-primary-600 dark:text-primary-400;
}

.prose code {
  @apply bg-bg rounded px-1 py-0.5;
}

.prose pre {
  @apply bg-bg p-4 rounded;
}

.prose blockquote {
  @apply border-l-4 border-primary-200 dark:border-primary-800 pl-4 italic;
}

/* Error Button */

</style>