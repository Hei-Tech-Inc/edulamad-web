You are a senior frontend engineer building a production-ready 
multi-tenant aquaculture farm management platform called Nsuo.

I am providing you with the Swagger JSON for the backend API. 
Read it completely before writing any code. Every API call, 
type, and endpoint must come from that Swagger JSON — do not 
invent endpoints or fields.

This is an end-to-end setup prompt. Complete everything in order.
Do not skip any section.

═══════════════════════════════════════════════════════
SECTION 1 — WHAT WE ARE BUILDING
═══════════════════════════════════════════════════════

Platform: Nsuo — fish farm management SaaS
Users: farm owners, managers, supervisors, workers, viewers
Data: farms, units (ponds/cages/nurseries), stock cycles, 
      daily records, weight samples, feeding logs, 
      harvests, disease events, weather observations,
      feed inventory, analytics, research API

Existing codebase: Next.js 15 Pages Router, Tailwind CSS,
Redux Toolkit, Supabase (being replaced by Nsuo API),
Recharts, xlsx, Lucide icons.

Goal: replace all direct Supabase calls with Nsuo API calls.
Keep all existing UI components that work. Replace only the 
data layer.

═══════════════════════════════════════════════════════
SECTION 2 — TECH STACK TO SET UP
═══════════════════════════════════════════════════════

Install these packages if not present:
  @tanstack/react-query@5
  @tanstack/react-query-devtools@5
  axios
  zod
  react-hook-form
  @hookform/resolvers
  zustand
  shadcdn
  @tanstack/react-table@8
  date-fns (already installed)

Do NOT install redux or redux-toolkit for new code.
Keep existing Redux store for now — migrate slices to 
Zustand one at a time without breaking anything.

Do NOT remove Recharts — keep all existing charts.
Do NOT remove xlsx — keep export functionality.



═══════════════════════════════════════════════════════
SECTION 4 — API CLIENT
═══════════════════════════════════════════════════════

src/api/client.ts:

Create an axios instance with:
  baseURL: process.env.NEXT_PUBLIC_API_URL
    (default http://localhost:5003/api/v1)


```json

{
  "openapi": "3.0.0",
  "paths": {
    "/": {
      "get": {
        "operationId": "AppController_getHello",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get API information",
        "tags": [
          "app"
        ]
      }
    },
    "/verify-email": {
      "get": {
        "operationId": "AuthRedirectController_verifyEmail",
        "parameters": [
          {
            "name": "token",
            "required": true,
            "in": "query",
            "description": "Email verification token",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Email verified successfully"
          },
          "400": {
            "description": "Invalid or expired token"
          }
        },
        "summary": "Verify email address (for email links without /auth prefix)",
        "tags": [
          "auth"
        ]
      }
    },
    "/metrics": {
      "get": {
        "operationId": "MetricsController_getMetrics",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Prometheus metrics in text format"
          }
        },
        "summary": "Prometheus metrics endpoint",
        "tags": [
          "metrics"
        ]
      }
    },
    "/users/profile": {
      "get": {
        "description": "Get the authenticated user's profile information. Password field is excluded from response.",
        "operationId": "UsersController_getProfile",
        "parameters": [],
        "responses": {
          "200": {
            "description": "User profile retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "user@example.com",
                    "name": "John Doe",
                    "firstName": "John",
                    "lastName": "Doe",
                    "emailVerified": true,
                    "isActive": true,
                    "profilePhoto": "https://cdn.example.com/public/photo.jpg",
                    "createdAt": "2026-01-17T15:30:00.000Z"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Get current user profile",
        "tags": [
          "users"
        ]
      },
      "patch": {
        "description": "Update the authenticated user's profile information. User will be re-indexed in search if FEATURE_SEARCH_ENABLED=true and FEATURE_JOBS_ENABLED=true.",
        "operationId": "UsersController_updateProfile",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateUserProfileDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Profile updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "user@example.com",
                    "name": "John Doe Updated",
                    "firstName": "John",
                    "lastName": "Doe",
                    "emailVerified": true,
                    "isActive": true,
                    "updatedAt": "2026-01-17T16:00:00.000Z"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid input data"
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          },
          "404": {
            "description": "User not found"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Update user profile",
        "tags": [
          "users"
        ]
      }
    },
    "/users/profile/photo": {
      "patch": {
        "description": "Upload a profile photo. **Requires FEATURE_OBJECT_STORAGE_ENABLED=true**. When disabled, this endpoint will return an error. Only image files are accepted.",
        "operationId": "UsersController_uploadProfilePhoto",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": [
                  "file"
                ],
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary",
                    "description": "Image file (JPEG, PNG, GIF, etc.)"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Profile photo uploaded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "key": "public/1705492800000-profile.jpg",
                    "url": "https://cdn.example.com/public/1705492800000-profile.jpg",
                    "message": "Profile photo uploaded successfully"
                  }
                }
              }
            }
          },
          "400": {
            "description": "No file provided or file is not an image"
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          },
          "503": {
            "description": "Object storage not available (FEATURE_OBJECT_STORAGE_ENABLED=false)"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Upload profile photo",
        "tags": [
          "users"
        ]
      }
    },
    "/auth/register": {
      "post": {
        "description": "Register a new user account. Password must be at least 8 characters. User will be indexed in search if FEATURE_SEARCH_ENABLED=true and FEATURE_JOBS_ENABLED=true.",
        "operationId": "AuthController_register",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterDto"
              },
              "examples": {
                "example": {
                  "value": {
                    "email": "user@example.com",
                    "password": "securePassword123",
                    "name": "John Doe"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User successfully registered",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "user": {
                      "id": "123e4567-e89b-12d3-a456-426614174000",
                      "email": "user@example.com",
                      "name": "John Doe",
                      "emailVerified": false,
                      "isActive": true,
                      "createdAt": "2026-01-16T10:00:00.000Z"
                    },
                    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
                    "refreshToken": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid input data"
          },
          "409": {
            "description": "User with this email already exists"
          },
          "429": {
            "description": "Too many requests - rate limited"
          }
        },
        "summary": "Register a new user",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/login": {
      "post": {
        "description": "Authenticate user and receive access and refresh tokens. Access tokens expire in 15 minutes, refresh tokens in 7 days.",
        "operationId": "AuthController_login",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginDto"
              },
              "examples": {
                "example": {
                  "value": {
                    "email": "user@example.com",
                    "password": "securePassword123"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "User successfully logged in",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "user": {
                      "id": "123e4567-e89b-12d3-a456-426614174000",
                      "email": "user@example.com",
                      "name": "John Doe",
                      "emailVerified": true,
                      "isActive": true,
                      "createdAt": "2026-01-16T10:00:00.000Z"
                    },
                    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
                    "refreshToken": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Invalid credentials"
          },
          "429": {
            "description": "Too many requests - rate limited"
          }
        },
        "summary": "Login user",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/refresh": {
      "post": {
        "description": "Obtain a new access token using a valid refresh token. Refresh tokens are valid for 7 days by default.",
        "operationId": "AuthController_refresh",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshTokenDto"
              },
              "examples": {
                "example": {
                  "value": {
                    "refreshToken": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Token refreshed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refreshToken": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Invalid or expired refresh token"
          }
        },
        "summary": "Refresh access token",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/logout": {
      "post": {
        "operationId": "AuthController_logout",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshTokenDto"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "User logged out successfully"
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Logout user",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/verify-email": {
      "post": {
        "description": "Verify email address using verification token. Requires FEATURE_MAIL_ENABLED=true and FEATURE_EMAIL_VERIFICATION_ENABLED=true",
        "operationId": "AuthController_verifyEmail",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyEmailDto"
              },
              "examples": {
                "example": {
                  "value": {
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Email verified successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "message": "Email verified successfully"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid or expired token"
          },
          "503": {
            "description": "Email service not available (FEATURE_MAIL_ENABLED=false)"
          }
        },
        "summary": "Verify email address (POST)",
        "tags": [
          "auth"
        ]
      },
      "get": {
        "description": "Verify email address via GET request (typically used in email links). Requires FEATURE_MAIL_ENABLED=true and FEATURE_EMAIL_VERIFICATION_ENABLED=true",
        "operationId": "AuthController_verifyEmailGet",
        "parameters": [
          {
            "name": "token",
            "required": true,
            "in": "query",
            "description": "Email verification token",
            "schema": {
              "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Email verified successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "message": "Email verified successfully"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid or expired token"
          },
          "503": {
            "description": "Email service not available (FEATURE_MAIL_ENABLED=false)"
          }
        },
        "summary": "Verify email address (GET - for email links)",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/resend-verification": {
      "post": {
        "description": "Resend email verification link. Requires FEATURE_MAIL_ENABLED=true and FEATURE_EMAIL_VERIFICATION_ENABLED=true",
        "operationId": "AuthController_resendVerification",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": {
                    "type": "string",
                    "format": "email",
                    "example": "user@example.com"
                  }
                },
                "required": [
                  "email"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Verification email sent",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "message": "Verification email sent"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Email already verified or invalid email"
          },
          "503": {
            "description": "Email service not available (FEATURE_MAIL_ENABLED=false)"
          }
        },
        "summary": "Resend verification email",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/forgot-password": {
      "post": {
        "description": "Request a password reset email. Requires FEATURE_MAIL_ENABLED=true",
        "operationId": "AuthController_forgotPassword",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ForgotPasswordDto"
              },
              "examples": {
                "example": {
                  "value": {
                    "email": "user@example.com"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "If the email exists, a password reset link has been sent",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "message": "If the email exists, a password reset link has been sent"
                  }
                }
              }
            }
          },
          "503": {
            "description": "Email service not available (FEATURE_MAIL_ENABLED=false)"
          }
        },
        "summary": "Request password reset",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/reset-password": {
      "post": {
        "description": "Reset password using reset token from email. Requires FEATURE_MAIL_ENABLED=true",
        "operationId": "AuthController_resetPassword",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResetPasswordDto"
              },
              "examples": {
                "example": {
                  "value": {
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
                    "password": "newSecurePassword123"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Password reset successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "message": "Password reset successfully"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid or expired token"
          },
          "503": {
            "description": "Email service not available (FEATURE_MAIL_ENABLED=false)"
          }
        },
        "summary": "Reset password",
        "tags": [
          "auth"
        ]
      }
    },
    "/auth/me": {
      "get": {
        "operationId": "AuthController_getMe",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Current user information"
          },
          "401": {
            "description": "Unauthorized"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Get current user",
        "tags": [
          "auth"
        ]
      }
    },
    "/health": {
      "get": {
        "operationId": "HealthController_check",
        "parameters": [],
        "responses": {
          "200": {
            "description": "The Health Check is successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "example": "ok"
                    },
                    "info": {
                      "type": "object",
                      "example": {
                        "database": {
                          "status": "up"
                        }
                      },
                      "additionalProperties": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": true
                      },
                      "nullable": true
                    },
                    "error": {
                      "type": "object",
                      "example": {

                      },
                      "additionalProperties": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": true
                      },
                      "nullable": true
                    },
                    "details": {
                      "type": "object",
                      "example": {
                        "database": {
                          "status": "up"
                        }
                      },
                      "additionalProperties": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": true
                      }
                    }
                  }
                }
              }
            }
          },
          "503": {
            "description": "The Health Check is not successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "example": "error"
                    },
                    "info": {
                      "type": "object",
                      "example": {
                        "database": {
                          "status": "up"
                        }
                      },
                      "additionalProperties": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": true
                      },
                      "nullable": true
                    },
                    "error": {
                      "type": "object",
                      "example": {
                        "redis": {
                          "status": "down",
                          "message": "Could not connect"
                        }
                      },
                      "additionalProperties": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": true
                      },
                      "nullable": true
                    },
                    "details": {
                      "type": "object",
                      "example": {
                        "database": {
                          "status": "up"
                        },
                        "redis": {
                          "status": "down",
                          "message": "Could not connect"
                        }
                      },
                      "additionalProperties": {
                        "type": "object",
                        "required": [
                          "status"
                        ],
                        "properties": {
                          "status": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "summary": "Health check endpoint",
        "tags": [
          "health"
        ]
      }
    },
    "/files/upload": {
      "post": {
        "description": "Upload a file to object storage. **Requires FEATURE_OBJECT_STORAGE_ENABLED=true**. When disabled, this endpoint will return an error.",
        "operationId": "FilesController_uploadFile",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": [
                  "file"
                ],
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary",
                    "description": "File to upload (any file type)"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "File uploaded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "key": "public/1705492800000-document.pdf",
                    "url": "https://cdn.example.com/public/1705492800000-document.pdf",
                    "filename": "document.pdf",
                    "mimetype": "application/pdf",
                    "size": 102400
                  }
                }
              }
            }
          },
          "400": {
            "description": "No file provided or invalid file"
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          },
          "503": {
            "description": "Object storage not available (FEATURE_OBJECT_STORAGE_ENABLED=false)"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Upload a file",
        "tags": [
          "files"
        ]
      }
    },
    "/files/{key}/signed-url": {
      "get": {
        "description": "Generate a time-limited signed URL for accessing a private file. **Requires FEATURE_OBJECT_STORAGE_ENABLED=true**.",
        "operationId": "FilesController_getSignedUrl",
        "parameters": [
          {
            "name": "key",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Signed URL generated",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "url": "https://s3.amazonaws.com/bucket/private/1705492800000-secret.pdf?X-Amz-Algorithm=...&X-Amz-Expires=3600"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          },
          "403": {
            "description": "Access denied - user does not own this file"
          },
          "404": {
            "description": "File not found"
          },
          "503": {
            "description": "Object storage not available (FEATURE_OBJECT_STORAGE_ENABLED=false)"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Get signed URL for private file",
        "tags": [
          "files"
        ]
      }
    },
    "/files/{key}": {
      "delete": {
        "description": "Delete a file from object storage. **Requires FEATURE_OBJECT_STORAGE_ENABLED=true**.",
        "operationId": "FilesController_deleteFile",
        "parameters": [
          {
            "name": "key",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "File deleted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "example": {
                    "message": "File deleted successfully"
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          },
          "403": {
            "description": "Access denied - user does not own this file"
          },
          "404": {
            "description": "File not found"
          },
          "503": {
            "description": "Object storage not available (FEATURE_OBJECT_STORAGE_ENABLED=false)"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Delete a file",
        "tags": [
          "files"
        ]
      }
    },
    "/search/tasks": {
      "get": {
        "description": "Returns no tasks. Task search depended on PostgreSQL/TypeORM, which Convex MVP replaced.",
        "operationId": "SearchController_searchTasks",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Empty task results"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Search tasks (removed — tasks module retired for EDULAMAD MVP)",
        "tags": [
          "search"
        ]
      }
    },
    "/search/users": {
      "get": {
        "description": "Search users by query string. **Requires FEATURE_SEARCH_ENABLED=true**.",
        "operationId": "SearchController_searchUsers",
        "parameters": [
          {
            "name": "q",
            "required": true,
            "in": "query",
            "description": "Search query",
            "schema": {
              "example": "john",
              "type": "string"
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "description": "Number of results",
            "schema": {
              "minimum": 1,
              "maximum": 100,
              "default": 20,
              "example": 20,
              "type": "number"
            }
          },
          {
            "name": "offset",
            "required": false,
            "in": "query",
            "description": "Offset for pagination",
            "schema": {
              "minimum": 0,
              "default": 0,
              "example": 0,
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Search results"
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          },
          "503": {
            "description": "Search service not available (FEATURE_SEARCH_ENABLED=false)"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Search users using Meilisearch",
        "tags": [
          "search"
        ]
      }
    },
    "/search/global": {
      "get": {
        "description": "Task search is disabled without the legacy tasks datastore.",
        "operationId": "SearchController_globalSearch",
        "parameters": [
          {
            "name": "q",
            "required": true,
            "in": "query",
            "description": "Search query",
            "schema": {
              "example": "learn",
              "type": "string"
            }
          },
          {
            "name": "limit",
            "required": false,
            "in": "query",
            "description": "Number of results per type",
            "schema": {
              "minimum": 1,
              "maximum": 50,
              "default": 10,
              "example": 10,
              "type": "number"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Search results"
          },
          "401": {
            "description": "Unauthorized - JWT token required"
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Global search (users only for EDULAMAD MVP)",
        "tags": [
          "search"
        ]
      }
    },
    "/institutions/universities": {
      "get": {
        "operationId": "InstitutionsController_listUniversities",
        "parameters": [
          {
            "name": "activeOnly",
            "required": false,
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List universities (cached)",
        "tags": [
          "institutions"
        ]
      },
      "post": {
        "operationId": "InstitutionsController_createUniversity",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateUniversityDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Create university (admin)",
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/universities/{id}": {
      "get": {
        "operationId": "InstitutionsController_getUniversity",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Get university by id",
        "tags": [
          "institutions"
        ]
      },
      "patch": {
        "operationId": "InstitutionsController_updateUniversity",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateUniversityDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Update university (admin)",
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/universities/{universityId}/colleges": {
      "get": {
        "operationId": "InstitutionsController_listColleges",
        "parameters": [
          {
            "name": "universityId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "activeOnly",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/colleges": {
      "post": {
        "operationId": "InstitutionsController_createCollege",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/colleges/{id}": {
      "patch": {
        "operationId": "InstitutionsController_updateCollege",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/colleges/{collegeId}/departments": {
      "get": {
        "operationId": "InstitutionsController_listDepartments",
        "parameters": [
          {
            "name": "collegeId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "activeOnly",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/departments": {
      "post": {
        "operationId": "InstitutionsController_createDepartment",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/departments/{id}": {
      "patch": {
        "operationId": "InstitutionsController_updateDepartment",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/departments/{deptId}/courses": {
      "get": {
        "operationId": "InstitutionsController_listCourses",
        "parameters": [
          {
            "name": "deptId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "activeOnly",
            "required": false,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/courses/by-code/{code}": {
      "get": {
        "operationId": "InstitutionsController_getCourseByCode",
        "parameters": [
          {
            "name": "code",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/courses/{id}": {
      "get": {
        "operationId": "InstitutionsController_getCourse",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "institutions"
        ]
      },
      "patch": {
        "operationId": "InstitutionsController_updateCourse",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "institutions"
        ]
      }
    },
    "/institutions/courses": {
      "post": {
        "operationId": "InstitutionsController_createCourse",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "institutions"
        ]
      }
    },
    "/students/me/profile": {
      "get": {
        "operationId": "StudentsController_myProfile",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Current student profile (Convex studentProfiles)",
        "tags": [
          "students"
        ]
      },
      "post": {
        "operationId": "StudentsController_upsertProfile",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Create or update student profile",
        "tags": [
          "students"
        ]
      }
    },
    "/students/me/streak": {
      "post": {
        "operationId": "StudentsController_streak",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Record daily activity for streak",
        "tags": [
          "students"
        ]
      }
    },
    "/students/me/xp": {
      "post": {
        "operationId": "StudentsController_xp",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Award XP (internal / gamification use)",
        "tags": [
          "students"
        ]
      }
    },
    "/questions/courses/{courseId}": {
      "get": {
        "operationId": "QuestionsController_listByCourse",
        "parameters": [
          {
            "name": "courseId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "year",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "level",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "type",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List past questions for a course",
        "tags": [
          "questions"
        ]
      }
    },
    "/questions/{id}/solutions": {
      "get": {
        "operationId": "QuestionsController_listSolutions",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      }
    },
    "/questions/{id}": {
      "get": {
        "operationId": "QuestionsController_getOne",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      },
      "delete": {
        "operationId": "QuestionsController_softDelete",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      }
    },
    "/questions/upload-queue": {
      "post": {
        "operationId": "QuestionsController_uploadQueue",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      }
    },
    "/questions": {
      "post": {
        "operationId": "QuestionsController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "courseId": {
                    "type": "string"
                  },
                  "year": {
                    "type": "number"
                  },
                  "levelData": {
                    "type": "number"
                  },
                  "questionText": {
                    "type": "string"
                  },
                  "type": {
                    "type": "string"
                  },
                  "source": {
                    "type": "string"
                  },
                  "file": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Create question; optional attachment → R2",
        "tags": [
          "questions"
        ]
      }
    },
    "/questions/{id}/verify": {
      "patch": {
        "operationId": "QuestionsController_verify",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      }
    },
    "/questions/{questionId}/solutions": {
      "post": {
        "operationId": "QuestionsController_addSolution",
        "parameters": [
          {
            "name": "questionId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      }
    },
    "/questions/solutions/{solutionId}/upvote": {
      "post": {
        "operationId": "QuestionsController_upvote",
        "parameters": [
          {
            "name": "solutionId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "questions"
        ]
      }
    },
    "/ai/chat": {
      "post": {
        "operationId": "AiController_chat",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Chat completion (OpenAI + Convex session + usage log)",
        "tags": [
          "ai"
        ]
      }
    },
    "/ai/complete": {
      "post": {
        "operationId": "AiController_complete",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "One-shot completion",
        "tags": [
          "ai"
        ]
      }
    },
    "/slides/courses/{courseId}": {
      "get": {
        "operationId": "SlidesController_list",
        "parameters": [
          {
            "name": "courseId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "List slides for course",
        "tags": [
          "slides"
        ]
      },
      "post": {
        "operationId": "SlidesController_upload",
        "parameters": [
          {
            "name": "courseId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Upload slide to R2 and enqueue processing",
        "tags": [
          "slides"
        ]
      }
    },
    "/slides/{id}/outputs": {
      "get": {
        "operationId": "SlidesController_outputs",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "slides"
        ]
      }
    },
    "/slides/{id}": {
      "delete": {
        "operationId": "SlidesController_remove",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "slides"
        ]
      }
    },
    "/exams/simulations": {
      "post": {
        "operationId": "ExamsController_start",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Start exam simulation",
        "tags": [
          "exams"
        ]
      }
    },
    "/exams/simulations/{id}": {
      "get": {
        "operationId": "ExamsController_getOne",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "exams"
        ]
      }
    },
    "/exams/simulations/{id}/answers": {
      "patch": {
        "operationId": "ExamsController_answers",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "exams"
        ]
      }
    },
    "/exams/simulations/{id}/complete": {
      "post": {
        "operationId": "ExamsController_complete",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "exams"
        ]
      }
    },
    "/exams/simulations/{id}/abandon": {
      "post": {
        "operationId": "ExamsController_abandon",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "exams"
        ]
      }
    },
    "/subscriptions/plans": {
      "get": {
        "operationId": "SubscriptionsController_plans",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "List subscription plans",
        "tags": [
          "subscriptions"
        ]
      }
    },
    "/subscriptions/me": {
      "get": {
        "operationId": "SubscriptionsController_mine",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "subscriptions"
        ]
      }
    },
    "/subscriptions/pay/upload-fee": {
      "post": {
        "operationId": "SubscriptionsController_payUploadFee",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "subscriptions"
        ]
      }
    },
    "/subscriptions/webhooks/paystack": {
      "post": {
        "operationId": "SubscriptionsController_paystackWebhook",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "summary": "Paystack webhook (requires raw body + x-paystack-signature in production)",
        "tags": [
          "subscriptions"
        ]
      }
    },
    "/gamification/leaderboard": {
      "get": {
        "operationId": "GamificationController_leaderboard",
        "parameters": [
          {
            "name": "scope",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "period",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "scopeId",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "summary": "Leaderboard (cached)",
        "tags": [
          "gamification"
        ]
      }
    },
    "/gamification/badges/me": {
      "get": {
        "operationId": "GamificationController_myBadges",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "gamification"
        ]
      }
    },
    "/gamification/wallet/me": {
      "get": {
        "operationId": "GamificationController_wallet",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "gamification"
        ]
      }
    },
    "/ta/upload-queue": {
      "get": {
        "operationId": "TaController_queue",
        "parameters": [
          {
            "name": "status",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "List upload queue items",
        "tags": [
          "ta"
        ]
      }
    },
    "/ta/upload-queue/{id}": {
      "patch": {
        "operationId": "TaController_review",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "tags": [
          "ta"
        ]
      }
    },
    "/notifications/me": {
      "get": {
        "operationId": "NotificationsController_myNotifications",
        "parameters": [
          {
            "name": "unreadOnly",
            "required": false,
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "In-app notifications for the current user (Convex users id)",
        "tags": [
          "notifications"
        ]
      }
    },
    "/notifications/{id}/read": {
      "patch": {
        "operationId": "NotificationsController_markRead",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Mark a notification as read",
        "tags": [
          "notifications"
        ]
      }
    },
    "/analytics/me": {
      "get": {
        "operationId": "AnalyticsController_mySnapshots",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Learning analytics snapshots for the current user",
        "tags": [
          "analytics"
        ]
      }
    },
    "/bookmarks/me": {
      "get": {
        "operationId": "BookmarksController_myBookmarks",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "List bookmarks for current user",
        "tags": [
          "bookmarks"
        ]
      }
    },
    "/bookmarks": {
      "post": {
        "operationId": "BookmarksController_add",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateBookmarkDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Add a bookmark (idempotent per ref)",
        "tags": [
          "bookmarks"
        ]
      }
    },
    "/bookmarks/{id}": {
      "delete": {
        "operationId": "BookmarksController_remove",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Remove a bookmark",
        "tags": [
          "bookmarks"
        ]
      }
    },
    "/flashcards/me": {
      "get": {
        "operationId": "FlashcardsController_myFlashcards",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "List flashcards for current user",
        "tags": [
          "flashcards"
        ]
      }
    },
    "/flashcards": {
      "post": {
        "operationId": "FlashcardsController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateFlashcardDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Create a flashcard",
        "tags": [
          "flashcards"
        ]
      }
    },
    "/flashcards/{id}": {
      "patch": {
        "operationId": "FlashcardsController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateFlashcardDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Update a flashcard",
        "tags": [
          "flashcards"
        ]
      },
      "delete": {
        "operationId": "FlashcardsController_remove",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Delete a flashcard",
        "tags": [
          "flashcards"
        ]
      }
    },
    "/timetables/me": {
      "get": {
        "operationId": "TimetablesController_myTimetables",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "List exam timetable entries for current user",
        "tags": [
          "timetables"
        ]
      }
    },
    "/timetables": {
      "post": {
        "operationId": "TimetablesController_create",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateTimetableDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Create a timetable entry",
        "tags": [
          "timetables"
        ]
      }
    },
    "/timetables/{id}": {
      "patch": {
        "operationId": "TimetablesController_update",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTimetableDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Update a timetable entry",
        "tags": [
          "timetables"
        ]
      },
      "delete": {
        "operationId": "TimetablesController_remove",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Delete a timetable entry",
        "tags": [
          "timetables"
        ]
      }
    },
    "/admin/stats": {
      "get": {
        "operationId": "AdminController_stats",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Aggregated stats (cached)",
        "tags": [
          "admin"
        ]
      }
    },
    "/admin/notifications": {
      "post": {
        "operationId": "AdminController_createNotification",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateAdminNotificationDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": ""
          }
        },
        "security": [
          {
            "JWT-auth": []
          }
        ],
        "summary": "Create an in-app / push / email notification for a user",
        "tags": [
          "admin"
        ]
      }
    }
  },
  "info": {
    "title": "NestJS Production API",
    "description": "Production-ready NestJS backend boilerplate API documentation.\n    \n**Feature Status:**\n- Background jobs disabled\n- Email service disabled\n- Object storage disabled\n\n**Feature Toggles:**\nAll features are controlled via environment variables:\n- FEATURE_REDIS_ENABLED\n- FEATURE_JOBS_ENABLED\n- FEATURE_MAIL_ENABLED\n- FEATURE_EMAIL_VERIFICATION_ENABLED\n- FEATURE_OBJECT_STORAGE_ENABLED\n- FEATURE_SEARCH_ENABLED\n\nSet these to \"true\" or \"false\" to enable/disable features.",
    "version": "1.0",
    "contact": {

    }
  },
  "tags": [
    {
      "name": "auth",
      "description": "Authentication endpoints"
    },
    {
      "name": "admin",
      "description": "Admin management endpoints (organizations, roles, permissions)"
    },
    {
      "name": "users",
      "description": "User management"
    },
    {
      "name": "tasks",
      "description": "Task management"
    },
    {
      "name": "files",
      "description": "File upload and management (requires FEATURE_OBJECT_STORAGE_ENABLED=true)"
    },
    {
      "name": "search",
      "description": "Search endpoints (requires FEATURE_SEARCH_ENABLED=true)"
    },
    {
      "name": "health",
      "description": "Health check endpoints"
    },
    {
      "name": "metrics",
      "description": "Metrics endpoints"
    }
  ],
  "servers": [],
  "components": {
    "securitySchemes": {
      "JWT-auth": {
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "type": "http",
        "name": "JWT",
        "description": "Enter JWT token",
        "in": "header"
      }
    },
    "schemas": {
      "UserPreferencesDto": {
        "type": "object",
        "properties": {
          "theme": {
            "type": "string",
            "description": "UI theme preference",
            "enum": [
              "light",
              "dark",
              "auto"
            ],
            "example": "dark"
          },
          "language": {
            "type": "string",
            "description": "Language preference (ISO 639-1 code)",
            "example": "en"
          },
          "notifications": {
            "type": "object",
            "description": "Notification preferences",
            "example": {
              "email": true,
              "push": false,
              "sms": false
            }
          }
        }
      },
      "SocialLinksDto": {
        "type": "object",
        "properties": {
          "twitter": {
            "type": "string",
            "description": "Twitter profile URL",
            "example": "https://twitter.com/username",
            "format": "uri"
          },
          "linkedin": {
            "type": "string",
            "description": "LinkedIn profile URL",
            "example": "https://linkedin.com/in/username",
            "format": "uri"
          },
          "github": {
            "type": "string",
            "description": "GitHub profile URL",
            "example": "https://github.com/username",
            "format": "uri"
          },
          "facebook": {
            "type": "string",
            "description": "Facebook profile URL",
            "example": "https://facebook.com/username",
            "format": "uri"
          }
        }
      },
      "UpdateUserProfileDto": {
        "type": "object",
        "properties": {
          "firstName": {
            "type": "string",
            "description": "First name",
            "example": "John"
          },
          "lastName": {
            "type": "string",
            "description": "Last name",
            "example": "Doe"
          },
          "phone": {
            "type": "string",
            "description": "Phone number",
            "example": "+1234567890"
          },
          "bio": {
            "type": "string",
            "description": "User bio",
            "example": "Software engineer passionate about NestJS and TypeScript"
          },
          "profilePhoto": {
            "type": "string",
            "description": "Profile photo URL or S3 key",
            "example": "public/1705492800000-profile.jpg"
          },
          "dateOfBirth": {
            "type": "string",
            "description": "Date of birth (ISO 8601 format)",
            "example": "1990-01-01",
            "format": "date"
          },
          "address": {
            "type": "string",
            "description": "Street address",
            "example": "123 Main St"
          },
          "city": {
            "type": "string",
            "description": "City",
            "example": "San Francisco"
          },
          "state": {
            "type": "string",
            "description": "State or province",
            "example": "CA"
          },
          "country": {
            "type": "string",
            "description": "Country",
            "example": "USA"
          },
          "zipCode": {
            "type": "string",
            "description": "ZIP or postal code",
            "example": "94102"
          },
          "website": {
            "type": "string",
            "description": "Personal website URL",
            "example": "https://johndoe.com",
            "format": "uri"
          },
          "company": {
            "type": "string",
            "description": "Company name",
            "example": "Acme Corporation"
          },
          "jobTitle": {
            "type": "string",
            "description": "Job title",
            "example": "Senior Software Engineer"
          },
          "preferences": {
            "description": "User preferences",
            "allOf": [
              {
                "$ref": "#/components/schemas/UserPreferencesDto"
              }
            ]
          },
          "socialLinks": {
            "description": "Social media links",
            "allOf": [
              {
                "$ref": "#/components/schemas/SocialLinksDto"
              }
            ]
          }
        }
      },
      "RegisterDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "description": "User email address",
            "example": "user@example.com",
            "format": "email"
          },
          "password": {
            "type": "string",
            "description": "User password (minimum 8 characters)",
            "example": "password123",
            "minLength": 8
          },
          "name": {
            "type": "string",
            "description": "User full name",
            "example": "John Doe"
          }
        },
        "required": [
          "email",
          "password",
          "name"
        ]
      },
      "LoginDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "description": "User email address",
            "example": "user@example.com",
            "format": "email"
          },
          "password": {
            "type": "string",
            "description": "User password",
            "example": "password123"
          }
        },
        "required": [
          "email",
          "password"
        ]
      },
      "RefreshTokenDto": {
        "type": "object",
        "properties": {
          "refreshToken": {
            "type": "string",
            "description": "Refresh token received from login or register",
            "example": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
          }
        },
        "required": [
          "refreshToken"
        ]
      },
      "VerifyEmailDto": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "description": "Email verification token sent to user email",
            "example": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
          }
        },
        "required": [
          "token"
        ]
      },
      "ForgotPasswordDto": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "description": "User email address to send password reset link",
            "example": "user@example.com",
            "format": "email"
          }
        },
        "required": [
          "email"
        ]
      },
      "ResetPasswordDto": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string",
            "description": "Password reset token received via email",
            "example": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
          },
          "password": {
            "type": "string",
            "description": "New password (minimum 8 characters)",
            "example": "newpassword123",
            "minLength": 8
          }
        },
        "required": [
          "token",
          "password"
        ]
      },
      "CreateUniversityDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "acronym": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "public",
              "private"
            ]
          },
          "logoKey": {
            "type": "string"
          },
          "websiteUrl": {
            "type": "string"
          },
          "isActive": {
            "type": "boolean",
            "default": true
          }
        },
        "required": [
          "name",
          "acronym",
          "location",
          "type",
          "isActive"
        ]
      },
      "UpdateUniversityDto": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "acronym": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "public",
              "private"
            ]
          },
          "logoKey": {
            "type": "string"
          },
          "websiteUrl": {
            "type": "string"
          },
          "isActive": {
            "type": "boolean"
          }
        }
      },
      "CreateBookmarkDto": {
        "type": "object",
        "properties": {
          "refType": {
            "type": "string",
            "enum": [
              "question",
              "solution",
              "slide"
            ]
          },
          "refId": {
            "type": "string",
            "description": "Target document id (Convex string id)"
          }
        },
        "required": [
          "refType",
          "refId"
        ]
      },
      "CreateFlashcardDto": {
        "type": "object",
        "properties": {
          "courseId": {
            "type": "string",
            "description": "Convex courses table id"
          },
          "front": {
            "type": "string"
          },
          "back": {
            "type": "string"
          },
          "source": {
            "type": "string",
            "enum": [
              "ai",
              "manual"
            ]
          }
        },
        "required": [
          "courseId",
          "front",
          "back",
          "source"
        ]
      },
      "UpdateFlashcardDto": {
        "type": "object",
        "properties": {
          "front": {
            "type": "string"
          },
          "back": {
            "type": "string"
          },
          "source": {
            "type": "string",
            "enum": [
              "ai",
              "manual"
            ]
          }
        }
      },
      "CreateTimetableDto": {
        "type": "object",
        "properties": {
          "courseId": {
            "type": "string",
            "description": "Convex courses table id"
          },
          "examDate": {
            "type": "string",
            "example": "2026-05-12"
          },
          "remindAt": {
            "type": "number",
            "description": "Unix ms when to remind"
          },
          "notified": {
            "type": "boolean"
          }
        },
        "required": [
          "courseId",
          "examDate",
          "remindAt",
          "notified"
        ]
      },
      "UpdateTimetableDto": {
        "type": "object",
        "properties": {
          "examDate": {
            "type": "string",
            "example": "2026-05-12"
          },
          "remindAt": {
            "type": "number"
          },
          "notified": {
            "type": "boolean"
          }
        }
      },
      "CreateAdminNotificationDto": {
        "type": "object",
        "properties": {
          "studentId": {
            "type": "string",
            "description": "Convex users table id of the recipient"
          },
          "type": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "body": {
            "type": "string"
          },
          "channel": {
            "type": "string",
            "enum": [
              "push",
              "email",
              "in_app"
            ]
          },
          "ctaUrl": {
            "type": "string"
          }
        },
        "required": [
          "studentId",
          "type",
          "title",
          "body",
          "channel"
        ]
      }
    }
  }
}

```