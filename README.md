# core-api

A modular and scalable API built with **NestJS** and **MongoDB**, designed to power a developer's portfolio and other personal projects.  
This backend serves as the central data source for multiple front-ends (e.g. portfolio, blog, etc).

---

## 🛠️ Tech Stack

- **NestJS** - (Modular backend framework)
- **MongoDB Atlas** - with dynamic database switching
- **Mongoose** - ODM for MongoDB
- **@nestjs/config** – Environment-based configuration

---

## 🚀 Getting Started

> ⚠️ **This project requires a MongoDB connection.**
>
> You can:
>
> - Create a free MongoDB Atlas cluster: https://www.mongodb.com/cloud/atlas/register
> - Replace `<username>` and `<password>` in the `.env` file with your actual credentials.

---

## ☁️ Storage Providers

This project supports multiple file storage providers via a pluggable architecture:

- `local` (default): stores files on the local filesystem (temporary usage).
- `cloudinary`: uploads files to [Cloudinary](https://cloudinary.com/).

Set the provider in your `.env`:

```env

STORAGE_PROVIDER=local # or "cloudinary"

Cloudinary Configuration
To use Cloudinary, add the following environment variables:

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

📝 You can get a free account at https://cloudinary.com

```

---

### 1. Clone the repo

```bash

 git clone https://github.com/EstebanSD/core-api.git
 cd core-api

```

### 2. Install dependencies

```bash

 npm install

```

### 3. Configure environment

Create your .env based on the provided .env.example:

```bash

 cp .env.example .env

```

### 4. Run in development

```bash

 npm run start:dev

```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
