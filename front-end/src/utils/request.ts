import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '@/constants'
import { ElMessage } from 'element-plus'
import router from '@/router'

export interface ApiResponse<T = any> {
  code?: number
  data: T
  message?: string
}

class Request {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  // Support function call style: request({ url, method, params, data })
  public call<T = any>(config: AxiosRequestConfig & { url: string; method?: string }): Promise<ApiResponse<T>> {
    const { url, method = 'get', params, data, ...restConfig } = config
    return this.instance({ url, method, params, data, ...restConfig })
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response.data
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response

          switch (status) {
            case 400:
              ElMessage.error(data.message || 'Bad request')
              break
            case 401:
              ElMessage.error('Unauthorized, please login again')
              localStorage.removeItem(STORAGE_KEYS.TOKEN)
              localStorage.removeItem(STORAGE_KEYS.USER)
              router.push('/')
              break
            case 403:
              ElMessage.error('Access forbidden')
              break
            case 404:
              ElMessage.error('Resource not found')
              break
            case 500:
              ElMessage.error('Server error')
              break
            default:
              ElMessage.error(data.message || 'Request failed')
          }
        } else {
          ElMessage.error('Network error, please check your connection')
        }
        return Promise.reject(error)
      }
    )
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config)
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config)
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config)
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config)
  }

  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config)
  }
}

const requestInstance = new Request()

// Support both function call style and method style
export const request = Object.assign(
  requestInstance.call.bind(requestInstance),
  {
    get: requestInstance.get.bind(requestInstance),
    post: requestInstance.post.bind(requestInstance),
    put: requestInstance.put.bind(requestInstance),
    delete: requestInstance.delete.bind(requestInstance),
    patch: requestInstance.patch.bind(requestInstance),
  }
)

export default request
