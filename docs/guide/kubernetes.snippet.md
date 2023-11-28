以下是一个 kubernetes 的部署参考：

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  name: van-blog
  labels:
    app: van-blog
spec:
  selector:
    matchLabels:
      app: van-blog
  template:
    spec:
      volumes:
        - name: host-time
          hostPath:
            path: /etc/localtime
            type: ''
        - name: static
          hostPath:
            path: /var/k8s/van-blog/static
            type: ''
        - name: log
          hostPath:
            path: /var/k8s/van-blog/log
            type: ''
      containers:
        - name: van-blog
          image: 'mereith/van-blog:latest'
          ports:
            - name: http-80
              containerPort: 80
              protocol: TCP
            - name: https-443
              containerPort: 443
              protocol: TCP
          env:
            - name: VAN_BLOG_DATABASE_URL
              value: >-
                mongodb://some@some@van.example.com:27017/vanBlog?authSource=admin


            - name: EMAIL
              value: >-
                vanblog@mereith.com


          resources:
            requests:
              memory: '300Mi'
              cpu: '250m'
          limits:
            memory: '500Mi'
            cpu: '500m'
          volumeMounts:
            - name: host-time
              readOnly: true
              mountPath: /etc/localtime
            - name: static
              mountPath: /app/static
            - name: log
              mountPath: /var/log
          imagePullPolicy: Always
```

启动完毕后，请 [完成初始化](./init.md)。
