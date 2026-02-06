import api from '@/lib/api';
import { UtilizationRecord } from '../types';

class ReportService {
    async getNgoUtilization(ngoId?: string, startDate?: string, endDate?: string): Promise<UtilizationRecord> {
        const params: Record<string, string> = {};
        if (ngoId) params.ngoId = ngoId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get('/reports/ngo-utilization', { params });
        return response.data;
    }

    async getNgoUtilizationMasterList(): Promise<UtilizationRecord[]> {
        const response = await api.get('/reports/ngo-utilization');
        return response.data;
    }
}

export default new ReportService();
