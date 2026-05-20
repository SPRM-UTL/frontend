import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Device {
  id: number;
  name: string;
  room: string;
  status: string;
  statusClass: string;
  power: string;
  lastActive: string;
  color: string;
  icon: string;
  powered: boolean;
}

@Component({
  selector: 'app-dispositivos',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './dispositivos.html',
  styleUrl: './dispositivos.css'
})
export class Dispositivos {
  activeNav = 'dispositivos';
  searchQuery = '';

  devices: Device[] = [
    {
      id: 1,
      name: 'Living Room Lights',
      room: 'Living Room',
      status: 'On',
      statusClass: 'status-on',
      power: '48W',
      lastActive: '2 min ago',
      color: '#f59e0b',
      icon: 'light',
      powered: true
    },
    {
      id: 2,
      name: 'Living Room AC',
      room: 'Living Room',
      status: 'Cooling',
      statusClass: 'status-cooling',
      power: '850W',
      lastActive: '5 min ago',
      color: '#3b82f6',
      icon: 'ac',
      powered: true
    },
    {
      id: 3,
      name: 'Smart TV',
      room: 'Living Room',
      status: 'Playing',
      statusClass: 'status-playing',
      power: '125W',
      lastActive: '1 min ago',
      color: '#8b5cf6',
      icon: 'tv',
      powered: true
    },
    {
      id: 4,
      name: 'Smart Speaker',
      room: 'Kitchen',
      status: 'Idle',
      statusClass: 'status-idle',
      power: '3W',
      lastActive: '10 min ago',
      color: '#10b981',
      icon: 'speaker',
      powered: true
    },
    {
      id: 5,
      name: 'Security Camera',
      room: 'Front Door',
      status: 'Recording',
      statusClass: 'status-recording',
      power: '12W',
      lastActive: '1 min ago',
      color: '#ef4444',
      icon: 'camera',
      powered: true
    },
    {
      id: 6,
      name: 'Smart Lock',
      room: 'Main Door',
      status: 'Locked',
      statusClass: 'status-locked',
      power: '2W',
      lastActive: '2h ago',
      color: '#f59e0b',
      icon: 'lock',
      powered: true
    },
    {
      id: 7,
      name: 'Ceiling Fan',
      room: 'Bedroom',
      status: 'Off',
      statusClass: 'status-off',
      power: '0W',
      lastActive: '5h ago',
      color: '#6b7280',
      icon: 'fan',
      powered: false
    },
    {
      id: 8,
      name: 'WiFi Router',
      room: 'Office',
      status: 'Connected',
      statusClass: 'status-connected',
      power: '15W',
      lastActive: '1 min ago',
      color: '#2bbfaa',
      icon: 'wifi',
      powered: true
    }
  ];

  filteredDevices: Device[] = [...this.devices];

  setActive(nav: string) {
    this.activeNav = nav;
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredDevices = q
      ? this.devices.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.room.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
      )
      : [...this.devices];
  }

  togglePower(device: Device) {
    device.powered = !device.powered;
    if (device.powered) {
      device.status = 'On';
      device.statusClass = 'status-on';
      device.lastActive = 'just now';
    } else {
      device.status = 'Off';
      device.statusClass = 'status-off';
    }
    // Re-apply filter to keep list in sync
    this.applyFilter();
  }
}
