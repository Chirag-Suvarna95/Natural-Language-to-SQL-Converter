# Project Setup Guide

This README provides step-by-step instructions to set up and run the project, including database setup, backend, and frontend services.

---

## **Prerequisites**

Ensure you have the following installed:
- **Python** (Recommended: 3.8+)
- **PostgreSQL**
- **Uvicorn**
- **Ollama**
- **Streamlit**

## **Step 1: Activate Virtual Environment**

Before running any commands, ensure you are in a virtual environment.

- **For Windows (PowerShell)**:
  ```sh
  venv\Scripts\activate
  ```
- **For macOS/Linux**:
  ```sh
  source venv/bin/activate
  ```

---

## **Step 2: Install Dependencies**

Before proceeding, install all required dependencies (In a virtual env):
```sh
pip install -r requirements.txt
```

---

## **Step 3: Set Up PostgreSQL Database**

Before running any services, create a **PostgreSQL** database.
(Or your anyone of your choice but do make the required changes to the code)

1. Open **psql**:
   ```sh
   psql -U postgres
   ```
2. Create a new database:
   ```sql
   CREATE DATABASE DBName;
   ```
3. Create necessary tables (refer to the `schema.sql` file if available).

---


## **Step 4: Start Backend Server**

In **Terminal 1**, run:
```sh
uvicorn deepseek_backend.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## **Step 5: Start Ollama Server**

In **Terminal 2**, run:
```sh
ollama serve
```

---

## **Step 6: Start DeepSeek Server**

In **Terminal 3**, run:
```sh
python deepseek_server.py
```

---

## **Step 7: Start Streamlit Frontend**
Switch to deepseek_backend

In **Terminal 4**, run:
```sh
streamlit run frontend.py
```

---

## **Additional Notes**
- If any process fails, check logs for errors and restart the respective service.

🚀 Happy Coding!

