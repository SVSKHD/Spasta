<template>
  <div class="relative">
    <!-- Floating + Button -->
    <div
      v-if="showPlus"
      :style="{ top: `${plusY}px` }"
      class="absolute left-[-30px] z-10"
    >
      <button
        @click="toggleInsertMenu"
        class="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2"
      >
        ➕
      </button>
      <div
        v-if="showMenu"
        class="mt-2 bg-white dark:bg-gray-800 shadow-md rounded-md p-2 space-y-1"
      >
        <button
          v-for="item in insertOptions"
          :key="item.label"
          @click="item.action"
          class="block w-full text-left py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <editor-content
      :editor="editor"
      @mousemove="handleMouseMove"
      class="tiptap border rounded-md p-4 bg-white dark:bg-gray-900 min-h-[500px]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits(["update:modelValue"]);

const editor = ref<Editor>();
const showPlus = ref(false);
const plusY = ref(100);
const showMenu = ref(false);

onMounted(() => {
  editor.value = new Editor({
    extensions: [StarterKit, Dropcursor, Image.configure({ inline: false })],
    content: props.modelValue || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none prose dark:prose-invert max-w-full",
      },
    },
    onUpdate({ editor }) {
      emit("update:modelValue", editor.getHTML());
      localStorage.setItem("note-draft", editor.getHTML());
    },
  });

  // Load Draft
  const saved = localStorage.getItem("note-draft");
  if (saved) {
    editor.value.commands.setContent(saved);
  }
});

function handleMouseMove(event: MouseEvent) {
  const y = event.offsetY;
  plusY.value = y;
  showPlus.value = true;
}

function toggleInsertMenu() {
  showMenu.value = !showMenu.value;
}

// Insert Options
const insertOptions = [
  { label: "Paragraph", action: () => insertBlock("paragraph") },
  { label: "Heading 2", action: () => insertBlock("heading") },
  { label: "Bullet List", action: () => insertBlock("bulletList") },
  { label: "Code Block", action: () => insertBlock("codeBlock") },
  { label: "Upload Image", action: uploadImage },
];

// Insert Different Blocks
function insertBlock(type: string) {
  showMenu.value = false;
  editor.value?.chain().focus();

  if (type === "heading") {
    editor.value?.chain().setNode("heading", { level: 2 }).run();
  } else {
    editor.value?.chain().setNode(type).run();
  }
}

async function uploadImage() {
  showMenu.value = false;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file); // (later: Firebase upload)
    editor.value?.chain().focus().setImage({ src: url }).run();
  };
}
</script>

<style scoped>
.tiptap {
  :first-child {
    margin-top: 0;
  }
  ul,
  ol {
    padding-left: 1.25rem;
  }
  h1,
  h2,
  h3 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  pre {
    background: #1e293b;
    color: #fff;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  blockquote {
    border-left: 4px solid #ccc;
    margin-left: 0;
    padding-left: 1rem;
    color: #666;
  }
}
</style>
