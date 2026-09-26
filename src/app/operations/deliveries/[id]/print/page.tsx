'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Boxes, Printer, ArrowLeft } from 'lucide-react';
import { inventoryService } from '@/lib/inventory/service';
import { Delivery } from '@/types';
import { formatDate } from '@/lib/utils';

export default function PrintDeliveryPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);

  useEffect(() => {
    if (id) {
      setDelivery(inventoryService.getDeliveryById(id));
    }
  }, [id]);

  if (!delivery) {
    return <div className="p-8 text-center text-sm">Loading delivery manifest...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 sm:p-12 font-sans">
      {/* Non-printable action header */}
      <div className="no-print flex items-center justify-between mb-8 pb-4 border-b border-gray-300">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Application
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors shadow-md"
        >
          <Printer className="w-4 h-4" /> Print Delivery Slip
        </button>
      </div>

      {/* Official Print Delivery Slip Area */}
      <div className="max-w-3xl mx-auto border border-gray-400 p-8 rounded-lg shadow-sm print-area">
        {/* Header with StockSense Branding */}
        <div className="flex items-start justify-between border-b-2 border-black pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white font-bold">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-wider uppercase">StockSense</h1>
            </div>
            <p className="text-xs text-gray-600 font-mono mt-1">Smart Warehouse Operations & Logistics</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-mono font-bold">{delivery.reference}</h2>
            <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-mono font-bold uppercase rounded border border-black">
              {delivery.status}
            </span>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
          <div>
            <span className="block font-bold text-gray-500 uppercase font-mono text-[10px]">Client / Recipient</span>
            <p className="font-bold text-sm text-black mt-0.5">{delivery.contact || 'Direct Customer'}</p>
            <p className="text-gray-700 mt-1 leading-relaxed">{delivery.delivery_address}</p>
          </div>

          <div className="text-right">
            <span className="block font-bold text-gray-500 uppercase font-mono text-[10px]">Fulfillment Facility</span>
            <p className="font-bold text-sm text-black mt-0.5">{delivery.warehouse_name}</p>
            <p className="text-gray-600 mt-1 font-mono">Date: {formatDate(delivery.schedule_date)}</p>
            <p className="text-gray-600 font-mono">Authorized By: {delivery.responsible_name}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black font-mono uppercase text-[11px]">
                <th className="py-2 px-3">Item Description</th>
                <th className="py-2 px-3">SKU / Code</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3">UoM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {delivery.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-semibold text-black">{item.product_name}</td>
                  <td className="py-3 px-3 font-mono text-gray-700">{item.sku}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-black">{item.quantity}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{item.unit || 'pcs'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures & Custody Verification Block */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-400 text-xs">
          <div>
            <p className="text-gray-600 mb-8">Dispatched by (Warehouse Representative):</p>
            <div className="border-b border-black w-48 mb-1" />
            <p className="font-mono text-[10px] text-gray-500">Sign & Stamp</p>
          </div>
          <div>
            <p className="text-gray-600 mb-8">Received in good order by (Client/Carrier):</p>
            <div className="border-b border-black w-48 mb-1" />
            <p className="font-mono text-[10px] text-gray-500">Sign & Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
