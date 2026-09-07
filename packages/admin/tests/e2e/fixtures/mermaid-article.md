# Mermaid editor fixture

Intro paragraph.

```mermaid
graph LR
  A[设备]-->B["Dnsmasq(:53)"]
  subgraph 软路由
      B-->|重定向| C["ADG Home(:3053)"]
  end
  C-->|转发| D["上游公共DNS服务器"]
```

```mermaid
graph TD
Start --> Stop
```

```mermaid
sequenceDiagram
Alice->>John: Hello John, how are you?
John-->>Alice: Great!
```

```mermaid
pie title Pets adopted by volunteers
"Dogs" : 386
"Cats" : 85
"Rats" : 15
```

```mermaid
graph TD;
style A fill:#9fe1e7,stroke:#333,stroke-width:2px;
style B fill:#ffcc99,stroke:#333,stroke-width:2px;
style C fill:#b3ffb3,stroke:#333,stroke-width:2px;
A[努力学习] -->|促进| B[协商脑力];
B -->|影响| C[幸运指数];
```
