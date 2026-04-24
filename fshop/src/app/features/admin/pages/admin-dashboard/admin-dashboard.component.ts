import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService, DashboardStats, Activity, SalesData } from '../../../../../service/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('salesCanvas') salesCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;
  private refreshInterval: any;

  stats: DashboardStats = { users: 0, products: 0, orders: 0, revenue: 0 };
  activities: Activity[] = [];
  topProducts: any[] = [];
  categorySalesStats: { name: string; percentage: number; color: string }[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadAllData();
    this.refreshInterval = setInterval(() => this.loadAllData(), 30000);
  }

  ngAfterViewInit() {
    setTimeout(() => this.loadSalesChart(), 500);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.chartInstance) this.chartInstance.destroy();
  }

  loadAllData() {
    this.loadStats();
    this.loadActivities();
    this.loadTopProducts();
    this.loadCategorySalesStats();
    this.loadSalesChart();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe(data => {
      this.stats = data;
    });
  }

  loadActivities() {
    this.dashboardService.getRecentActivities().subscribe(data => {
      this.activities = data;
    });
  }

  loadTopProducts() {
    this.dashboardService.getTopProducts().subscribe(data => {
      this.topProducts = data;
    });
  }

  loadCategorySalesStats() {
    this.dashboardService.getCategorySalesStats().subscribe(data => {
      this.categorySalesStats = data;
    });
  }

  loadSalesChart() {
    this.dashboardService.getSalesData().subscribe((data: SalesData) => {
      this.createChart(data);
    });
  }

  createChart(data: SalesData) {
    if (!this.salesCanvas) return;
    const ctx = this.salesCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.raw as number;
                return `${value.toLocaleString()} FCFA`;
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value: any) => Number(value).toLocaleString() + ' FCFA'
            }
          }
        }
      } as ChartConfiguration['options']
    });
  }

  formatMoney(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}