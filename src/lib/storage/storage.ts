export interface StorageItem<T> {
  id: string;
  data: T;
  createdAt: Date;
  updatedAt: Date;
}

class LocalStorage {
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  getItem<T>(key: string): StorageItem<T>[] {
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data, (key, value) => {
      if (
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "dueDate" ||
        key === "date"
      ) {
        return new Date(value);
      }
      return value;
    });
  }

  addItem<T>(key: string, data: T): StorageItem<T> {
    const items = this.getItem<T>(key);
    const now = new Date();

    const newItem: StorageItem<T> = {
      id: this.generateId(),
      data,
      createdAt: now,
      updatedAt: now,
    };

    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));

    return newItem;
  }

  updateItem<T>(
    key: string,
    id: string,
    data: Partial<T>,
  ): StorageItem<T> | null {
    const items = this.getItem<T>(key);
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      data: { ...items[index].data, ...data },
      updatedAt: new Date(),
    };

    items[index] = updatedItem;
    localStorage.setItem(key, JSON.stringify(items));

    return updatedItem;
  }

  deleteItem<T>(key: string, id: string): boolean {
    const items = this.getItem<T>(key);
    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === items.length) return false;

    localStorage.setItem(key, JSON.stringify(filteredItems));
    return true;
  }

  clear(key: string): void {
    localStorage.removeItem(key);
  }
}

export const storage = new LocalStorage();