# Kids Card Games

A simple web-based collection of card games designed for children to play against a computer opponent. Built with Node.js, Express, and vanilla JavaScript.

## Games Included

- **Go Fish** - Collect pairs by asking your opponent for matching cards
- **Old Maid** - Match pairs and avoid being stuck with the Old Maid card

## Running Locally

### Prerequisites
- Node.js 18 or higher
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to [http://localhost:3000](http://localhost:3000)

For development with auto-reload:
```bash
npm run dev
```

## Docker Deployment

### Build the Docker Image

```bash
docker build -t kids-card-games .
```

### Run the Container

```bash
docker run -p 3000:3000 kids-card-games
```

Access the games at [http://localhost:3000](http://localhost:3000)

### Kubernetes Deployment

Example Kubernetes deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kids-card-games
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kids-card-games
  template:
    metadata:
      labels:
        app: kids-card-games
    spec:
      containers:
      - name: kids-card-games
        image: kids-card-games:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: kids-card-games
spec:
  selector:
    app: kids-card-games
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

Deploy to your cluster:
```bash
kubectl apply -f k8s-deployment.yaml
```

## Project Structure

```
.
├── server.js              # Express server
├── package.json           # Dependencies
├── Dockerfile            # Container configuration
├── public/               # Static files
│   ├── index.html        # Game selection page
│   ├── css/
│   │   └── styles.css    # Shared styles
│   ├── games/
│   │   ├── go-fish.html  # Go Fish game page
│   │   └── old-maid.html # Old Maid game page
│   └── js/
│       ├── go-fish.js    # Go Fish game logic
│       └── old-maid.js   # Old Maid game logic
└── README.md
```

## Features

- Kid-friendly UI with bright colors and large text
- Simple AI opponent for solo play
- No external dependencies for game logic
- Responsive design works on tablets and desktops
- Lightweight container for easy deployment

## License

MIT
