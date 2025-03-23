declare namespace VanBlog {
  interface InitialState {
    settings?: Record<string, any>;
    theme?: string;
    [key: string]: any;
  }
}

export = VanBlog;
export as namespace VanBlog;
