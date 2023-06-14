// Hello World! program
using System;

namespace HelloWorld
{
    class Hello
    {
        static void Main(string[] args)
        {
            var counter = 0;
            var max = 100;
            while (max is -1 || counter < max)
            {
                Console.WriteLine($"Counter: {++counter}");
                System.Threading.Thread.Sleep(1000);
            }
        }
    }
}