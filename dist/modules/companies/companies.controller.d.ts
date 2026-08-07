import { Request, Response } from 'express';
export declare const createCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllCompaniesAdmin: (req: Request, res: Response) => Promise<void>;
export declare const updateCompanyAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const registerCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const assignUserToCompany: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCompanyContracts: (req: Request, res: Response) => Promise<void>;
export declare const addCompanyContract: (req: Request, res: Response) => Promise<void>;
export declare const deleteCompanyContract: (req: Request, res: Response) => Promise<void>;
export declare const deleteCompanyAdmin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=companies.controller.d.ts.map