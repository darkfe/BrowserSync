using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace ProxyConfigManager
{
    public class ProxyManager
    {
        [DllImport("wininet.dll", SetLastError = true)]
        private static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lPBuffer, int lpdwBufferLength);

        private const int INTERNET_OPTION_REFRESH = 0x000025;
        private const int INTERNET_OPTION_SETTINGS_CHANGED = 0x000027;

        private List<string> proxylibs = new List<string>();

        private void Refresh()
        {
            InternetSetOption(IntPtr.Zero, INTERNET_OPTION_SETTINGS_CHANGED, IntPtr.Zero, 0);
            InternetSetOption(IntPtr.Zero, INTERNET_OPTION_REFRESH, IntPtr.Zero, 0);
        }


        public ProxyManager()
        {
            /*
            OpenFileDialog opf = new OpenFileDialog();
            if (opf.ShowDialog().Equals(DialogResult.OK))
            {
                string[] proxylist = File.ReadAllLines(opf.FileName, Encoding.Default);
                for (int i = 0; i < proxylist.Length; i++)
                    this.proxylibs.Add(proxylist[i]);
            }
            */
        }

        public void SetProxy(int index)
        {
            RegistryKey key = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", true);
            key.SetValue("ProxyServer", this.proxylibs[index]);
            key.SetValue("ProxyEnable", 1);
            key.Close();
            this.Refresh();
        }

        public static void Main(String[] args) {
            ProxyManager pm = new ProxyManager();
            if (args.Length > 0)
            {
                if (args[0] == "refresh")
                {
                    Console.Out.WriteLine("Start to refresh settings.");
                    pm.Refresh();
                    Console.Out.WriteLine("It's done.");
                }
            }
        }
    }
}
