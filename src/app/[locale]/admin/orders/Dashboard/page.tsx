import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import db from "@/server/db/db";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SalesData {
  amount: number;
  numberOfSales: number;
}

interface UserData {
  userCount: number;
  averageValuePerUser: number;
}

interface ProductData {
  activeCount: number;
  inactiveCount: number;
}

interface DashboardCardProps {
  title: string;
  subtitle: string;
  body: string;
}

async function getSalesData(): Promise<SalesData> {
  try {
    const data = await db.order.aggregate({
      _sum: { totalPrice: true },
      _count: true,
    });

    return {
      amount: (data._sum.totalPrice || 0) / 100,
      numberOfSales: data._count || 0,
    };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return { amount: 0, numberOfSales: 0 };
  }
}

async function getUserData(): Promise<UserData> {
  try {
    const [userCount, orderData] = await Promise.all([
      db.user.count(),
      db.order.aggregate({
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      userCount: userCount || 0,
      averageValuePerUser:
        userCount === 0
          ? 0
          : (orderData._sum.totalPrice || 0) / userCount / 100,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { userCount: 0, averageValuePerUser: 0 };
  }
}

async function getProductData(): Promise<ProductData> {
  try {
    const [activeCount, inactiveCount] = await Promise.all([
      db.product.count(),
      db.product.count({
        where: {
          // يمكنك إضافة شرط بديل هنا، مثل:
          // stock: { equals: 0 }
        },
      }),
    ]);

    return {
      activeCount: activeCount || 0,
      inactiveCount: inactiveCount || 0,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return { activeCount: 0, inactiveCount: 0 };
  }
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg bg-black text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 shadow-sm border border-indigo-700/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{body}</p>
      </CardContent>
    </Card>
  );
}

// كومبوننت السكيلتون
function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <Skeleton width={200} height={36} className="mb-6" /> {/* العنوان */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton height={20} width="60%" className="mb-2" /> {/* العنوان */}
              <Skeleton height={16} width="80%" /> {/* الوصف */}
              <Skeleton height={32} width="50%" className="mt-4" /> {/* النص الرئيسي */}
            </Card>
          ))}
      </div>
    </div>
  );
}

// كومبوننت منفصل للمحتوى
async function DashboardContent() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Sales"
          subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
          body={formatCurrency(salesData.amount)}
        />
        <DashboardCard
          title="Customers"
          subtitle={`${formatCurrency(userData.averageValuePerUser)} Average Value`}
          body={formatNumber(userData.userCount)}
        />
        <DashboardCard
          title="Products"
          subtitle={`${formatNumber(productData.inactiveCount)} Inactive`}
          body={formatNumber(productData.activeCount)}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

export const revalidate = 3600; // 1 hour