export interface IO {
    ask(question: string): Promise<string>;
    print(message: string): void | Promise<void>;
    printJson(data: unknown): void | Promise<void>;
    confirm(question: string): Promise<boolean>;
}
